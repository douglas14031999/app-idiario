import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, concatMap, forkJoin, from, map } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DisciplinesPersisterService } from './disciplines_persister';
import { ExamRulesService } from '../exam_rules';

@Injectable()
export class ExamRulesPersisterService {
  constructor(
    private storage: Storage,
    private disciplinesPersister: DisciplinesPersisterService,
    private examRules: ExamRulesService,
  ) {}

  persist(user: any, classrooms: any[]): Observable<any> {
    return new Observable((observer) => {
      const examRulesObservables = classrooms.flatMap((classroomList) =>
        classroomList.map((classroom: { id: number }) =>
          this.examRules.getOnlineExamRules(user.teacher_id, classroom.id),
        ),
      );

      forkJoin(examRulesObservables)
        .pipe(
          concatMap((results: any) =>
            from(this.storage.set('examRules', results)).pipe(
              map(() => results),
            ),
          ),
          mergeMap(() =>
            forkJoin([this.disciplinesPersister.persist(user, classrooms)]),
          ),
        )
        .subscribe(
          (results) => observer.next(results),
          (error) => observer.error(error),
          () => observer.complete(),
        );
    });
  }
}
