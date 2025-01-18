import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LessonPlansService } from '../lesson_plans';
import { User } from '../../data/user.interface';

@Injectable()
export class LessonPlansPersisterService {
  constructor(
    private lessonPlans: LessonPlansService,
    private storage: Storage,
  ) {}

  persist(user: User): Observable<any> {
    const lessonPlansObservables = this.lessonPlans.getLessonPlans(
      user.teacher_id,
    );

    const setLessonPlansInStorage = tap((lessonPlans) =>
      this.storage.set('lessonPlans', lessonPlans),
    );

    return forkJoin([lessonPlansObservables]).pipe(setLessonPlansInStorage);
  }
}
