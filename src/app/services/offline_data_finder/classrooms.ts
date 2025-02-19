import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable()
export class OfflineClassroomFinder {
  constructor(private storage: StorageService) {}

  find(classroomId: any) {
    return new Observable((observer) => {
      this.storage.get('classrooms').then((allClassrooms) => {
        const classroom = allClassrooms
          .flatMap((unity: { data: { id: any }[] }) => unity.data)
          .find((classroom: { id: any }) => classroom.id == classroomId);

        observer.next(classroom);
        observer.complete();
      });
    });
  }
}
