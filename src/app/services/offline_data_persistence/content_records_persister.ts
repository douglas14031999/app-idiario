import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ContentRecordsService } from '../content_records';
import { User } from '../../data/user.interface';

@Injectable()
export class ContentRecordsPersisterService {
  constructor(
    private contentRecordsService: ContentRecordsService,
    private storage: Storage,
  ) {}

  persist(user: User) {
    const contentRecordsObservables =
      this.contentRecordsService.getContentRecords(user.teacher_id);

    const setLessonPlansInStorage = tap((contentRecords) =>
      this.storage.set('contentRecords', contentRecords),
    );

    return forkJoin([contentRecordsObservables]).pipe(setLessonPlansInStorage);
  }
}
