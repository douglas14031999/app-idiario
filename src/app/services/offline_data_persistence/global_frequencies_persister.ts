import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, forkJoin, from, of } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';
import { DailyFrequencyService } from '../daily_frequency';

@Injectable()
export class GlobalFrequenciesPersisterService {
  constructor(
    private storage: Storage,
    private frequencies: DailyFrequencyService,
  ) {}

  persist(user: any, classrooms: any[], examRules: any[]): Observable<any> {
    const frequenciesObservables = classrooms
      .flatMap((classroomList) => classroomList.data[0])
      .map((classroom: { id: number }) => {
        const currentExamRule = examRules.find(
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
      });

    return forkJoin(frequenciesObservables).pipe(
      concatMap((results: any[]): Observable<any[]> => {
        // TODO continuar a partir daqui e entender lógica abaixo
        return from(this.storage.get('frequencies')).pipe(
          map((frequencies: any): any[] => {
            const notEmptyResults = results
              .filter(this.notEmptyDailyFrequencies)
              .map((result: any) => result?.data?.daily_frequencies || []);
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
        );
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
