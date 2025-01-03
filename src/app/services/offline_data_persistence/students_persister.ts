import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, forkJoin, from } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { StudentsService } from '../students';

@Injectable()
export class StudentsPersisterService {
  constructor(
    private storage: Storage,
    private students: StudentsService,
  ) {}

  persist(user: any, disciplines: any[]): Observable<any> {
    const studentsObservables = disciplines.flatMap((disciplineList): Observable<any>[] =>
      disciplineList.data.map((discipline: { id: number }) =>
        this.students.getStudents(
          disciplineList.classroomId,
          discipline.id,
          user.teacher_id,
        ),
      ),
    );

    return forkJoin(studentsObservables).pipe(
      concatMap((results) => from(this.storage.set('students', results))),
      catchError((error) => {
        console.error(error);
        return [];
      }),
    );
  }
}
