import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DisciplinesService } from '../disciplines';

@Injectable()
export class DisciplinesPersisterService {
  constructor(
    private storage: Storage,
    private disciplines: DisciplinesService,
  ) {}

  persist(user: any, classrooms: any[]): Observable<any> {
    const classroomObservables = classrooms
      .flatMap((classroomList) => classroomList.data[0])
      .map((classroom: { id: number }) =>
        this.disciplines.getOnlineDisciplines(user.teacher_id, classroom.id),
      );

    const setDisciplinesInStorage = tap((disciplines) =>
      this.storage.set('disciplines', disciplines),
    );

    return forkJoin(classroomObservables).pipe(setDisciplinesInStorage);
  }
}
