import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, forkJoin, from } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { DailyFrequencyService } from '../daily_frequency';

@Injectable()
export class DisciplineFrequenciesPersisterService {
  constructor(
    private storage: Storage,
    private frequencies: DailyFrequencyService,
  ) {}

  private notEmptyDailyFrequencies(dailyFrequencies: any): boolean {
    return (
      dailyFrequencies &&
      dailyFrequencies.data &&
      dailyFrequencies.data.daily_frequencies &&
      dailyFrequencies.data.daily_frequencies.length > 0
    );
  }

  persist(user: any, disciplines: any[], examRules: any[]): Observable<any> {
    const onlyFrequencyByDiscipline = (item: { classroomId: number }) => {
      const currentExamRule = examRules.find(
        (rule: any) => rule.classroomId === item.classroomId,
      );

      if (!currentExamRule) {
        return false;
      }

      const isSameClassroom = currentExamRule.classroomId == item.classroomId;
      const allowFrequencyByDiscipline =
        currentExamRule.data.exam_rule.frequency_type === '2' ||
        currentExamRule.data.exam_rule.allow_frequency_by_discipline;

      return isSameClassroom && allowFrequencyByDiscipline;
    };
    const mountObserversToFrequencies = (list: {
      data: { id: number }[];
      classroomId: number;
    }) =>
      list.data.flatMap((discipline: { id: any }) =>
        this.frequencies.getFrequencies(
          list.classroomId,
          discipline.id,
          user.teacher_id,
        ),
      );

    const frequenciesObservables = disciplines
      .filter(onlyFrequencyByDiscipline)
      .flatMap(mountObserversToFrequencies);

    // TODO continuar a partir daqui e entender lógica abaixo
    return forkJoin(frequenciesObservables).pipe(
      concatMap((results: any[]) =>
        from(this.storage.get('frequencies')).pipe(
          map((frequencies: any) => ({ results, frequencies })),
        ),
      ),
      map(({ results, frequencies }) => {
        const notEmptyResults = results.filter(this.notEmptyDailyFrequencies);
        const newFrequencies = notEmptyResults.flatMap(
          (result: any) => result.data.daily_frequencies,
        );

        if (frequencies) {
          newFrequencies.push(...frequencies.daily_frequencies);
        }

        this.storage.set('frequencies', { daily_frequencies: newFrequencies });
      }),
    );
  }
}
