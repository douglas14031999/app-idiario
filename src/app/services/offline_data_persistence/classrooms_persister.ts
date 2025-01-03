import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from 'src/app/data/user.interface';
import { ClassroomsService } from '../classrooms';
import { StorageService } from '../storage.service';

@Injectable()
export class ClassroomsPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private storage: StorageService,
  ) {}

  persist(user: User, unities: any[]): Observable<any> {
    const classroomsObservables = unities.map((unity) => {
      return this.classrooms.getOnlineClassrooms(user.teacher_id, unity.id);
    });

    const transformClassrooms = map((classrooms) => [
      {
        data: classrooms,
        unityId: unities[0].id,
      },
    ]);

    const setClassroomsInStorage = tap((classrooms) =>
      this.storage.set('classrooms', classrooms),
    );

    return forkJoin(classroomsObservables).pipe(
      transformClassrooms,
      setClassroomsInStorage,
    );
  }
}
