import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {
  Observable,
  concat,
  of,
  from,
  forkJoin,
  switchMap,
  mergeMap,
} from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
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
import { DisciplineFrequenciesPersisterService } from './discipline_frequencies_persister';
import { StudentsPersisterService } from './students_persister';
import { GlobalFrequenciesPersisterService } from './global_frequencies_persister';

@Injectable()
export class OfflineDataPersisterService {
  constructor(
    private storage: Storage,
    private unitiesPersister: UnitiesPersisterService,
    private classroomsPersister: ClassroomsPersisterService,
    private examRulesPersister: ExamRulesPersisterService,
    private schoolCalendarsPersister: SchoolCalendarsPersisterService,
    private disciplinesPersister: DisciplinesPersisterService,
    private disciplinePersister: DisciplinesPersisterService,
    private lessonPlansPersister: LessonPlansPersisterService,
    private contentLessonPlansPersister: ContentLessonPlansPersisterService,
    private contentRecordsPersister: ContentRecordsPersisterService,
    private teachingPlansPersister: TeachingPlansPersisterService,
    private disciplineFrequenciesPersister: DisciplineFrequenciesPersisterService,
    private studentsPersister: StudentsPersisterService,
    private globalFrequenciesPersister: GlobalFrequenciesPersisterService,
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

  persist(user: User): Observable<any> {
    if (this.connectionService.isOnline) {
      this.clearStorage();
    }

    return of(user).pipe(
      map((user) => ({ user })),

      switchMap((payload) =>
        forkJoin({
          unities: this.unitiesPersister.persist(user),
        }).pipe(map((result) => ({ ...payload, ...result }))),
      ),

      switchMap((payload) =>
        forkJoin({
          schoolCalendars: this.schoolCalendarsPersister.persist(
            user,
            payload.unities,
          ),
          classrooms: this.classroomsPersister.persist(user, payload.unities),
        }).pipe(map((result) => ({ ...payload, ...result }))),
      ),

      switchMap((payload) =>
        forkJoin({
          examRules: this.examRulesPersister.persist(user, payload.classrooms),
        }).pipe(map((result) => ({ ...payload, ...result }))),
      ),

      switchMap((payload) =>
        forkJoin({
          disciplines: this.disciplinesPersister.persist(
            user,
            payload.classrooms,
          ),
        }).pipe(map((result) => ({ ...payload, ...result }))),
      ),

      switchMap((payload) =>
        forkJoin({
          globalFrequencies: this.globalFrequenciesPersister.persist(
            user,
            payload.classrooms,
            payload.examRules,
          ),
          // disciplineFrequencies: this.disciplineFrequenciesPersister.persist(user, payload.disciplines, payload.examRules),
          students: this.studentsPersister.persist(user, payload.disciplines),
        }).pipe(map((result) => ({ ...payload, ...result }))),
      ),

      catchError((error) => {
        console.error(error);
        throw error;
      }),
    );

    // return this.unitiesPersister.persist(user);

    // return concat(
    //   this.unitiesPersister.persist(user).pipe(catchError(() => of(void 0))),
    //   // this.lessonPlansPersister
    //   //   .persist(user)
    //   //   .pipe(catchError(() => of(void 0))),
    //   // this.contentRecordsPersister
    //   //   .persist(user)
    //   //   .pipe(catchError(() => of(void 0))),
    //   // this.contentLessonPlansPersister
    //   //   .persist(user)
    //   //   .pipe(catchError(() => of(void 0))),
    //   // this.teachingPlansPersister
    //   //   .persist(user)
    //   //   .pipe(catchError(() => of(void 0))),
    // ).pipe(
    //   concatMap(() => of(void 0)), // Emit a single void value to complete the observable
    //   catchError((error) => {
    //     console.error(error);
    //     return of(void 0);
    //   }),
    // );
  }
}
