import { ApiService } from './../api';
import { Observable, from, forkJoin, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { map, concatMap, catchError, tap } from 'rxjs/operators';

@Injectable()
export class ContentRecordsSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: StorageService,
  ) { }

  public sync(contentRecords: any[], teacherId: number): Observable<any> {
    if (!contentRecords || !contentRecords.length) {
      return of(null);
    }

    const requests = contentRecords.map((contentRecord) => {
      contentRecord['teacher_id'] = teacherId;
      return this.http.post(this.api.getContentRecordsSyncUrl(), contentRecord).pipe(
        tap((result: any) => {
          this.destroyPendingSyncRecord(result);
        }),
        catchError((error) => {
          console.error(
            'Erro ao sincronizar contentRecord:',
            'classroomId:', contentRecord.classroom_id,
            'disciplineId:', contentRecord.discipline_id,
            'date:', contentRecord.record_date,
            'error:', error
          );
          return of(null);
        })
      );
    });

    return forkJoin(requests);
  }

  private destroyPendingSyncRecord(contentRecord: any) {
    from(this.storage.get('contentRecordsToSync')).subscribe(
      (contentRecords) => {
        const updatedRecords = contentRecords.filter((cr: any) => {
          return (
            contentRecord.classroom_id !== cr.classroom_id ||
            contentRecord.discipline_id !== cr.discipline_id ||
            contentRecord.record_date !== cr.record_date
          );
        });
        this.storage.set('contentRecordsToSync', updatedRecords);
      },
    );
  }
}
