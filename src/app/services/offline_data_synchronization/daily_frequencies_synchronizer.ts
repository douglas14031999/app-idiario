import { ApiService } from './../api';
import { Observable, from, forkJoin, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth';
import { map, concatMap, catchError } from 'rxjs/operators';

@Injectable()
export class DailyFrequenciesSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private auth: AuthService,
  ) { }

  public sync(dailyFrequencies: any[]): Observable<any> {
    if (!dailyFrequencies || dailyFrequencies.length === 0) {
      return of(null);
    }

    return this.auth.currentUser().pipe(
      concatMap((user) => {
        const requests = dailyFrequencies.map((df) => {
          return this.mountDailyFrequencyPostRequest(df, user.teacher_id).pipe(
            catchError((error) => {
              console.error(
                'Erro ao sincronizar dailyFrequency:',
                'unityId:', df.unity_id,
                'classroomId:', df.classroom_id,
                'date:', df.frequency_date,
                'error:', error
              );
              return of(null);
            })
          );
        });
        return forkJoin(requests);
      })
    );
  }

  private mountDailyFrequencyPostRequest(
    dailyFrequency: any,
    teacherId: number,
  ): Observable<any> {
    return this.http
      .post(this.api.getDailyFrequencyUrl(), {
        unity_id: dailyFrequency.unity_id,
        classroom_id: dailyFrequency.classroom_id,
        frequency_date: dailyFrequency.frequency_date,
        discipline_id: dailyFrequency.discipline_id,
        class_number: dailyFrequency.class_number,
        teacher_id: teacherId,
      })
      .pipe(
        map((response: any) => {
          return response;
        }),
      );
  }
}
