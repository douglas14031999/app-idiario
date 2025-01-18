import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SchoolCalendarsService } from '../school_calendars';

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
