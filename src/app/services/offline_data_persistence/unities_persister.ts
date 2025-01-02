import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { ClassroomsPersisterService } from './classrooms_persister';
import { SchoolCalendarsPersisterService } from './school_calendars_persister';
import { StorageService } from '../storage.service';
import { UnitiesService } from '../unities';
import { User } from '../../data/user.interface';

@Injectable()
export class UnitiesPersisterService {
  constructor(
    private unities: UnitiesService,
    private classroomsPersister: ClassroomsPersisterService,
    private schoolCalendarsPersister: SchoolCalendarsPersisterService,
    private storage: StorageService,
  ) {}

  persist(user: User): Observable<any> {
    return this.unities.getOnlineUnities(user.teacher_id).pipe(
      concatMap((unities) =>
        forkJoin([
          this.classroomsPersister.persist(user, unities),
          this.schoolCalendarsPersister.persist(user, unities),
        ]).pipe(
          concatMap(() => this.storage.set('unities', unities)!),
          catchError((error) => {
            console.error(error);
            throw error; // Propaga o erro para o Observable principal
          }),
        ),
      ),
    );
  }
}
