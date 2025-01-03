import { SchoolCalendarsService } from '../school_calendars';
import { Observable, forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable()
export class SchoolCalendarsPersisterService {
  constructor(
    private storage: Storage,
    private schoolCalendars: SchoolCalendarsService,
  ) {}

  persist(user: any, unities: any[]): Observable<any> {
    const schoolCalendarObservables = unities.map((unity) =>
      this.schoolCalendars.getOnlineSchoolCalendar(unity.id),
    );

    const setSchoolCalendarsInStorage = tap((schoolCalendars) =>
      this.storage.set('schoolCalendars', schoolCalendars),
    );

    return forkJoin(schoolCalendarObservables).pipe(
      setSchoolCalendarsInStorage,
    );
  }
}
