import { Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { concatMap, catchError, map } from 'rxjs/operators';
import { ApiService } from '../api';
import { AuthService } from '../auth';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';

@Injectable()
export class DailyFrequencyStudentsSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: StorageService,
    private auth: AuthService,
  ) { }

  public sync(dailyFrequencyStudents: any[]): Observable<any> {
    if (!dailyFrequencyStudents || dailyFrequencyStudents.length === 0) {
      return new Observable((observer) => observer.complete());
    }

    return this.auth.currentUser().pipe(
      concatMap((user) => {
        const requests = dailyFrequencyStudents.map((dfs) => {
          return this.http
            .post(this.api.getDailyFrequencyStudentsUpdateOrCreateUrl(), {
              present: dfs.present,
              user_id: dfs.userId,
              classroom_id: dfs.classroomId,
              discipline_id: dfs.disciplineId,
              student_id: dfs.studentId,
              class_number: dfs.classNumber,
              frequency_date: dfs.frequencyDate,
              teacher_id: user.teacher_id,
            })
            .pipe(
              catchError((error) => {
                console.error(
                  'Erro ao sincronizar dailyFrequencyStudent:',
                  'studentId:', dfs.studentId,
                  'classroomId:', dfs.classroomId,
                  'date:', dfs.frequencyDate,
                  'status:', error.status,
                  'message:', error.message,
                );
                return of(null);
              }),
            );
        });

        return forkJoin(requests);
      }),
      concatMap(() => {
        // Limpar as frequências sincronizadas após o sucesso
        return this.clearSyncedFrequencies();
      }),
      catchError((error) => {
        console.error('Erro durante a sincronização de frequências de alunos:', error);
        return of(null);
      }),
    );
  }

  private clearSyncedFrequencies(): Observable<any> {
    return from(this.storage.set('dailyFrequencyStudentsToSync', []));
  }

  private deleteFrequencies(dailyFrequencyStudents: any[]): void {
    from(this.storage.get('dailyFrequencyStudentsToSync'))
      .pipe(
        map((localDailyFrequencyStudents) => {
          if (!localDailyFrequencyStudents) return [];

          return localDailyFrequencyStudents.filter((localDfs: any) => {
            return !dailyFrequencyStudents.some((dfs: any) =>
              this.isSameDailyFrequencyStudent(dfs, localDfs),
            );
          });
        }),
        concatMap((newDailyFrequencyStudents) =>
          this.storage.set(
            'dailyFrequencyStudentsToSync',
            newDailyFrequencyStudents,
          ),
        ),
      )
      .subscribe();
  }

  private isSameDailyFrequencyStudent(dfs1: any, dfs2: any): boolean {
    return (
      dfs1.classNumber === dfs2.classNumber &&
      dfs1.classroomId === dfs2.classroomId &&
      dfs1.disciplineId === dfs2.disciplineId &&
      dfs1.frequencyDate === dfs2.frequencyDate &&
      dfs1.studentId === dfs2.studentId
    );
  }
}
