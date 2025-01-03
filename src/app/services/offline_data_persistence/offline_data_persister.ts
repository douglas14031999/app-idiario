import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, concat, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { ClassroomsPersisterService } from './classrooms_persister';
import { ContentLessonPlansPersisterService } from './content_lesson_plans_persister';
import { ContentRecordsPersisterService } from './content_records_persister';
import { DisciplinesPersisterService } from './disciplines_persister';
import { ExamRulesPersisterService } from './exam_rules_persister';
import { LessonPlansPersisterService } from './lesson_plans_persister';
import { SchoolCalendarsPersisterService } from './school_calendars_persister';
import { TeachingPlansPersisterService } from './teaching_plans_persister';
import { UnitiesPersisterService } from './unities_persister';
import { ConnectionService } from '../connection';
import { User } from '../../data/user.interface';

@Injectable()
export class OfflineDataPersisterService {
  constructor(
    private storage: Storage,
    private unitiesPersister: UnitiesPersisterService,
    private classroomsPersister: ClassroomsPersisterService,
    private examRulesPersister: ExamRulesPersisterService,
    private schoolCalendarPersister: SchoolCalendarsPersisterService,
    private disciplinePersister: DisciplinesPersisterService,
    private lessonPlansPersister: LessonPlansPersisterService,
    private contentLessonPlansPersister: ContentLessonPlansPersisterService,
    private contentRecordsPersister: ContentRecordsPersisterService,
    private teachingPlansPersister: TeachingPlansPersisterService,
    private connectionService: ConnectionService,
  ) {}

  // TODO confirmar
  // Entender se deve ser apagado o storage se o usuário for o mesmo, pois
  // caso a sessão do usuário tenha se expirado, talvez os dados existentes
  // ainda não tenham sido sincronizados
  private clearStorage(): void {
    this.storage.remove('classrooms').then();
    this.storage.remove('contentLessonPlans').then();
    this.storage.remove('contentRecords').then();
    this.storage.remove('disciplines').then();
    this.storage.remove('examRules').then();
    this.storage.remove('frequencies').then(); // TODO
    this.storage.remove('lessonPlans').then(); // TODO
    this.storage.remove('schoolCalendars').then();
    this.storage.remove('teachingPlans').then(); // TODO
    this.storage.remove('unities').then();
  }

  persist(user: User): Observable<void> {
    if (this.connectionService.isOnline) {
      this.clearStorage();
    }

    return concat(
      this.unitiesPersister.persist(user).pipe(catchError(() => of(void 0))),
      this.lessonPlansPersister
        .persist(user)
        .pipe(catchError(() => of(void 0))),
      this.contentRecordsPersister
        .persist(user)
        .pipe(catchError(() => of(void 0))),
      this.contentLessonPlansPersister
        .persist(user)
        .pipe(catchError(() => of(void 0))),
      this.teachingPlansPersister
        .persist(user)
        .pipe(catchError(() => of(void 0))),
    ).pipe(
      concatMap(() => of(void 0)), // Emit a single void value to complete the observable
      catchError((error) => {
        console.error(error);
        return of(void 0);
      }),
    );
  }
}
