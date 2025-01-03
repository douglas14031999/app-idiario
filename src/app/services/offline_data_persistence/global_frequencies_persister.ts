import { DailyFrequencyService } from '../daily_frequency';
import { ClassroomsService } from '../classrooms';
import { Observable, forkJoin, from, of } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class GlobalFrequenciesPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private storage: Storage,
    private frequencies: DailyFrequencyService,
  ) {}

  async persist(user: any, classrooms: any[]): Promise<Observable<any>> {
    return from(this.storage.get('examRules')).pipe(
      concatMap((examRule) => {
        // Flatten o array de classrooms se for necessário
        const frequenciesObservables = classrooms.flatMap((classroomList) => {
          return classroomList.data[0].map(
            (classroom: any): Observable<any> => {
              const currentExamRule = examRule.find(
                (rule: any) => rule.classroomId === classroom.id,
              );

              if (currentExamRule) {
                return this.frequencies.getFrequencies(
                  classroom.id,
                  0,
                  user.teacher_id,
                );
              } else {
                return of(null); // Retorna um observable que emite null quando não há frequências necessárias
              }
            },
          );
        });

        // TODO deprecated
        return forkJoin(frequenciesObservables).pipe(
          concatMap(
            (results: any[]): Observable<any[]> =>
              from(this.storage.get('frequencies')).pipe(
                map((frequencies: any): any[] => {
                  const notEmptyResults = results
                    .filter(this.notEmptyDailyFrequencies)
                    .map(
                      (result: any) => result?.data?.daily_frequencies || [],
                    );
                  let newFrequencies = [];

                  if (notEmptyResults.length > 0) {
                    newFrequencies = notEmptyResults.reduce(
                      (a: any[], b: any[]) => a.concat(b),
                      [],
                    );
                    if (frequencies && frequencies.daily_frequencies) {
                      newFrequencies = newFrequencies.concat(
                        frequencies.daily_frequencies,
                      );
                    }
                    this.storage.set('frequencies', {
                      daily_frequencies: newFrequencies,
                    });
                  }
                  return newFrequencies; // Garante que retornamos as novas frequências
                }),
                catchError((error) => {
                  console.error(error);
                  return of([]); // Retorna um array vazio em caso de erro para continuar a cadeia de observables
                }),
              ),
          ),
        );
      }),
      catchError((error) => {
        console.error(error);
        return of([]); // Retorna um array vazio em caso de erro para continuar a cadeia de observables
      }),
    );
  }

  // TODO lógica modificada
  private notEmptyDailyFrequencies(dailyFrequencies: any): boolean {
    return (
      dailyFrequencies &&
      dailyFrequencies.data &&
      dailyFrequencies.data.daily_frequencies &&
      dailyFrequencies.data.daily_frequencies.length > 0
    );
  }
}
