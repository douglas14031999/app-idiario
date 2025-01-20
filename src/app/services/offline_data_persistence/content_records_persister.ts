import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ContentRecordsService } from '../content_records';
import { User } from '../../data/user.interface';
import { StorageService } from '../storage.service';

@Injectable()
export class ContentRecordsPersisterService {
  constructor(
    private contentRecordsService: ContentRecordsService,
    private storage: StorageService,
  ) {}

  persist(user: User) {
    const contentRecordsObservables =
      this.contentRecordsService.getContentRecords(user.teacher_id);

    const transformLessonPlansStructure = map((contentRecords: any) =>
      contentRecords.flatMap((record: any) => record.content_records),
    );

    const setLessonPlansInStorage = tap((contentRecords) =>
      this.storage.set('contentRecords', contentRecords),
    );

    return forkJoin([contentRecordsObservables]).pipe(
      transformLessonPlansStructure,
      setLessonPlansInStorage,
    );
  }
}
