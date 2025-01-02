import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, tap, mergeMap } from 'rxjs/operators';
import { ExamRulesPersisterService } from './exam_rules_persister';
import { ClassroomsService } from '../classrooms';
import { User } from 'src/app/data/user.interface';
import { StorageService } from '../storage.service';

@Injectable()
export class ClassroomsPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private examRulesPersister: ExamRulesPersisterService,
    private storage: StorageService,
  ) {}

  persist(user: User, unities: any[]): Observable<any> {
    return new Observable((observer) => {
      const classroomsObservables = unities.map((unity) => {
        return this.classrooms.getOnlineClassrooms(user.teacher_id, unity.id);
      });

      forkJoin(classroomsObservables)
        .pipe(
          tap((classrooms: any) => {
            let classes = [
              {
                data: classrooms,
                unityId: unities[0].id,
              },
            ];

            this.storage.set('classrooms', classes);
          }),
          mergeMap((classrooms: any) =>
            forkJoin([this.examRulesPersister.persist(user, classrooms)]),
          ),
          catchError((error: any) => {
            console.error(error);
            observer.error(error);
            throw error;
          }),
        )
        .subscribe({
          next: () => {}, // Você pode tratar os valores aqui, se necessário
          error: (error: any) => observer.error(error),
          complete: () => observer.complete(),
        });
    });
  }
}
