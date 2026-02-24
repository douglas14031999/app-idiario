import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, LoadingController, NavParams } from '@ionic/angular';
import { catchError, finalize, of, tap } from 'rxjs';
import { Classroom } from '../data/classroom.interface';
import { Unity } from '../data/unity.interface';
import { User } from '../data/user.interface';
import { AuthService } from '../services/auth';
import { ClassroomsService } from '../services/classrooms';
import { DailyFrequencyService } from '../services/daily_frequency';
import { DisciplinesService } from '../services/disciplines';
import { ExamRulesService } from '../services/exam_rules';
import { MessagesService } from '../services/messages';
import { SchoolCalendarsService } from '../services/school_calendars';
import { StorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils';

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.page.html',
  styleUrls: ['./frequency.page.scss'],
  providers: [NavParams],
  standalone: false,
})
export class FrequencyPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;

  unities: Unity[] = [];
  unityId: number | undefined;
  classrooms: Classroom[] = [];
  classroomId: number | undefined;
  date: any;
  currentDate: Date = new Date();
  globalAbsence = true;
  disciplines: any;
  disciplineId!: number | undefined;
  classes: any;
  selectedClasses: any[] = [];

  constructor(
    private classroomsService: ClassroomsService,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private dailyFrequencyService: DailyFrequencyService,
    private examRulesService: ExamRulesService,
    private disciplinesService: DisciplinesService,
    private schoolCalendarsService: SchoolCalendarsService,
    private utilsService: UtilsService,
    private cdr: ChangeDetectorRef,
    private messages: MessagesService,
    private storage: StorageService,
    private router: Router,
  ) { }

  async ngOnInit() {
    if (!this.date) {
      const currentDate = this.utilsService.getCurrentDate();
      this.date = this.utilsService.toStringWithoutTime(currentDate);
    }
    if (!this.unities || !this.unities.length) {
      this.unities = await this.storage.get('unities');
    }
  }

  ionViewWillLeave() {
    this.utilsService.leaveView(true);
  }

  scrollTo(elementId: string) {
    const yOffset = document.getElementById(elementId)?.offsetTop || 0;
    //this.content.scrollToPoint(0, yOffset, 1000);
  }

  onChangeUnity() {
    if (!this.unityId) {
      return;
    }
    this.showLoader('Carregando...').then((loader) => {
      this.auth.currentUser().subscribe((user: User) => {
        this.classroomsService.getOfflineClassrooms(this.unityId!).subscribe({
          next: (classrooms: any) => {
            this.schoolCalendarsService
              .getOfflineSchoolCalendar(this.unityId!)
              .subscribe({
                next: (schoolCalendar: any) => {
                  this.resetSelectedValues();
                  this.classrooms = classrooms.data || [];
                  loader.dismiss();

                  if (!schoolCalendar.data) {
                    this.messages.showToast(
                      'Calendário escolar não encontrado.',
                    );
                    return;
                  }

                  this.classes = this.schoolCalendarsService.getClasses(
                    schoolCalendar.data.number_of_classes,
                  );
                  this.cdr.detectChanges();
                  this.scrollTo('frequency-classroom');
                },
                error: (error) => {
                  this.resetOptions();
                  loader.dismiss();
                  this.messages.showToast(error);
                },
              });
          },
          error: (error) => {
            this.resetOptions();
            loader.dismiss();
            this.messages.showToast(error);
          },
        });
      });
    });
  }

  async onChangeClassroom() {
    if (!this.classroomId) {
      return;
    }

    const classroomId = Number(this.classroomId);

    this.disciplineId = undefined;

    // Evitar ExpressionChangedAfterItHasBeenCheckedError
    let _classes = this.classes;
    this.classes = [];
    this.selectedClasses = [];
    this.cdr.detectChanges(); // Aviso: pode ser sintoma de outro problema
    this.classes = _classes;

    const loader = await this.loadingCtrl.create({
      message: 'Carregando...',
    });
    await loader.present();

    this.examRulesService
      .getOfflineExamRules(classroomId)
      .pipe(
        tap((result: any) => {
          if (!result || !result.data) {
            this.messages.showToast('Nenhuma regra de avaliação encontrada. Por favor, sincronize os dados.');
            return;
          }
          if (
            result.data.exam_rule &&
            result.data.exam_rule.allow_frequency_by_discipline
          ) {
            this.disciplinesService
              .getOfflineDisciplines(classroomId)
              .pipe(
                tap((disciplineResult: any) => {
                  if (!disciplineResult || !disciplineResult.data) {
                    this.messages.showToast('Nenhuma disciplina encontrada.');
                    return;
                  }
                  this.disciplines = disciplineResult.data;
                  this.globalAbsence = false;
                  this.cdr.detectChanges();
                  this.scrollTo('frequency-discipline');
                }),
                catchError((error) => {
                  console.log(error);
                  return of(null);
                }),
                finalize(() => loader.dismiss()),
              )
              .subscribe();
          } else {
            this.globalAbsence = true;
            this.cdr.detectChanges();
            this.scrollTo('frequency-date');
            loader.dismiss();
          }
        }),
        catchError((error) => {
          console.log(error);
          return of(null);
        }),
        finalize(() => loader.dismiss()),
      )
      .subscribe();
  }

  onChangeDiscipline() {
    this.scrollTo('frequency-classes');
  }

  frequencyForm(form: NgForm) {
    const unityId = form.value.unity;
    const classroomId = form.value.classroom;
    const date = this.utilsService.dateToTimezone(form.value.date);
    const stringDate = this.utilsService.toStringWithoutTime(date);
    const disciplineId = form.value.discipline;
    const classes = this.selectedClasses || [];

    this.showLoader('Carregando...').then((loader) => {
      this.auth.currentUser().subscribe((user) => {
        this.dailyFrequencyService
          .getStudents({
            userId: user.id,
            teacherId: user.teacher_id,
            unityId: unityId,
            classroomId: classroomId,
            frequencyDate: stringDate,
            disciplineId: disciplineId,
            classNumbers: classes.join(),
          })
          .subscribe({
            next: (result: any) => {
              const navigationExtras = {
                queryParams: {
                  global: this.globalAbsence,
                },
                state: {
                  result,
                },
              };

              this.router.navigate(
                ['/students-frequency-edit'],
                navigationExtras,
              );

              loader.dismiss();
            },
            error: (error) => {
              loader.dismiss();
            },
          });
      });
    });
  }

  resetSelectedValues() {
    this.globalAbsence = true;
    this.classroomId = undefined;
    this.disciplineId = undefined;
    this.selectedClasses = [];
  }

  resetOptions() {
    this.classrooms = [];
    this.disciplines = [];
    this.classes = [];
    this.resetSelectedValues();
  }

  updateSelectedClasses(selectedClass: any) {
    const index = this.selectedClasses.indexOf(selectedClass);

    if (index < 0) {
      this.selectedClasses.push(selectedClass);
    } else {
      this.selectedClasses.splice(index, 1);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }

  private async showLoader(message: string) {
    const loader = await this.loadingCtrl.create({
      message: message,
    });
    await loader.present();
    return loader;
  }
}
