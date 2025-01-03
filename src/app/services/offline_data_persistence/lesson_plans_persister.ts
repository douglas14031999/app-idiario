import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
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
    return this.lessonPlans.getLessonPlans(user.teacher_id).pipe(
      tap((lessonPlans) => {
        this.storage.set('lessonPlans', lessonPlans).then(() => {});
      }),
    );
  }
}
