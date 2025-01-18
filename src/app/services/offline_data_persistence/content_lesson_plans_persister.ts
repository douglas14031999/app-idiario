import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ContentLessonPlansService } from '../content_lesson_plans';
import { StorageService } from '../storage.service';
import { User } from '../../data/user.interface';

@Injectable()
export class ContentLessonPlansPersisterService {
  constructor(
    private contentLessonPlansService: ContentLessonPlansService,
    private storage: StorageService,
  ) {}

  persist(user: User) {
    const contentLessonPlansObservables =
      this.contentLessonPlansService.getContentLessonPlans(user.teacher_id);

    const setLessonPlansInStorage = tap((contentLessonPlans) =>
      this.storage.set('contentLessonPlans', contentLessonPlans),
    );

    return forkJoin([contentLessonPlansObservables]).pipe(
      setLessonPlansInStorage,
    );
  }
}
