import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TeachingPlansService } from '../teaching_plans';
import { User } from '../../data/user.interface';
import { StorageService } from '../storage.service';

@Injectable()
export class TeachingPlansPersisterService {
  constructor(
    private teachingPlans: TeachingPlansService,
    private storage: StorageService,
  ) {}

  persist(user: User): Observable<any> {
    const teachingPlansObservables = this.teachingPlans.getTeachingPlans(
      user.teacher_id,
    );

    const setLessonPlansInStorage = tap((teachingPlans) =>
      this.storage.set('teachingPlans', teachingPlans),
    );

    return forkJoin([teachingPlansObservables]).pipe(setLessonPlansInStorage);
  }
}
