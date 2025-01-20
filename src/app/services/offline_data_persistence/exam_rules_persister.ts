import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExamRulesService } from '../exam_rules';
import { User } from '../../data/user.interface';
import { StorageService } from '../storage.service';

@Injectable()
export class ExamRulesPersisterService {
  constructor(
    private storage: StorageService,
    private examRules: ExamRulesService,
  ) {}

  persist(user: User, classrooms: any[]): Observable<any> {
    // TODO entender melhor esta estrutura
    const examRulesObservables = classrooms
      .flatMap((classroomList) => classroomList.data[0])
      .map((classroom: { id: number }) =>
        this.examRules.getOnlineExamRules(user.teacher_id, classroom.id),
      );

    const setExamRulesInStorage = tap((examRules) =>
      this.storage.set('examRules', examRules),
    );

    return forkJoin(examRulesObservables).pipe(setExamRulesInStorage);
  }
}
