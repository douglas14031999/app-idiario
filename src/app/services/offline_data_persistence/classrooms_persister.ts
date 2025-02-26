import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClassroomsService } from '../classrooms';
import { StorageService } from '../storage.service';
import { User } from '../../data/user.interface';

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

    const setClassroomsInStorage = tap((classrooms) =>
      this.storage.set('classrooms', classrooms),
    );

    return forkJoin(classroomsObservables).pipe(setClassroomsInStorage);
  }
}
