import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { DailyFrequencyService } from '../services/daily_frequency';
import { StorageService } from '../services/storage.service';
import { SyncProvider } from '../services/sync';
import { UtilsService } from '../services/utils';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  lastFrequencyDays: any = [];
  currentDate: Date = new Date();
  private loadingSync!: HTMLIonLoadingElement;

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private loadingCtrl: LoadingController,
    private dailyFrequencyService: DailyFrequencyService,
    private auth: AuthService,
    private utilsService: UtilsService,
    private storage: StorageService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    await this.sync.isSyncDelayed();

    this.route.params.subscribe(async () => {
      await this.refreshLastFrequencyDays();
    });
  }

  // Resolve o problema com a desatualização dos dados.
  async refreshLastFrequencyDays() {
    const currentDate = this.currentDate;
    this.currentDate = new Date();
    this.lastFrequencyDays = [];
    await this.loadMoreFrequencies();
    this.currentDate = currentDate;
  }

  async newFrequency() {
    await this.router.navigate(['/frequency']);
  }

  private lastTenFrequencies(frequencies: any[]) {
    const lastDays = [];
    const frequencyLimit = 30;

    for (let i = frequencyLimit; i > 0; i--) {
      const shortDate = this.utilsService.toStringWithoutTime(this.currentDate);
      const frequenciesOfDay = this.frequenciesOfDay(frequencies, shortDate);

      lastDays.push({
        date: shortDate,
        format_date: this.utilsService.toExtensiveFormat(this.currentDate),
        exists: frequenciesOfDay.length > 0,
        unities: this.unitiesOfFrequency(frequenciesOfDay),
      });

      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }

    return lastDays;
  }

  private frequenciesOfDay(frequencies: any[], date: string) {
    return frequencies.filter((frequency) => frequency.frequency_date === date);
  }

  unitiesOfFrequency(frequencies: any[]) {
    if (!frequencies) {
      return [];
    }

    const unities: { id: any; name: any; classroomDisciplines: any[] }[] = [];

    frequencies.forEach((frequency) => {
      if (
        unities.findIndex((unity) => unity.id == frequency.unity_id) === -1
      ) {
        unities.push({
          id: frequency.unity_id,
          name: frequency.unity_name,
          classroomDisciplines: this.classroomDisciplinesOfUnityFrequency(
            frequencies,
            frequency.unity_id,
          ),
        });
      }
    });
    return unities;
  }

  classroomDisciplinesOfUnityFrequency(frequencies: any[], unityId: number) {
    const frequenciesOfUnity = frequencies.filter(
      (frequency) => frequency.unity_id == unityId,
    );
    const classroomDisciplines: {
      classroomId: any;
      disciplineId: any;
      classroomName: any;
      disciplineName: any;
      classNumbers: any[];
    }[] = [];

    frequenciesOfUnity.forEach((frequency) => {
      const indexOfClassroomDiscipline = classroomDisciplines.findIndex(
        (cd) =>
          cd.classroomId == frequency.classroom_id &&
          cd.disciplineId == frequency.discipline_id,
      );

      if (indexOfClassroomDiscipline < 0) {
        classroomDisciplines.push({
          classroomId: frequency.classroom_id,
          classroomName: frequency.classroom_name,
          disciplineId: frequency.discipline_id,
          disciplineName: frequency.discipline_name,
          classNumbers: frequency.class_number ? [frequency.class_number] : [],
        });
      } else if (frequency.class_number) {
        classroomDisciplines[indexOfClassroomDiscipline].classNumbers.push(
          frequency.class_number,
        );
      }
    });

    return classroomDisciplines.sort((cd1, cd2) => {
      const desc1 = this.utilsService.comparableString(
        cd1.classroomName + cd1.disciplineName,
      );
      const desc2 = this.utilsService.comparableString(
        cd2.classroomName + cd2.disciplineName,
      );
      return desc1 > desc2 ? 1 : desc2 > desc1 ? -1 : 0;
    });
  }

  async loadMoreFrequencies() {
    this.loadingSync = await this.loadingCtrl.create({
      message: 'Carregando...',
    });

    await this.loadingSync.present();

    const frequencies = await this.storage.get('frequencies');

    if (frequencies) {
      const newFrequencies = this.lastTenFrequencies(
        frequencies.daily_frequencies,
      );

      if (newFrequencies.length > 0) {
        this.lastFrequencyDays = this.lastFrequencyDays.concat(newFrequencies);
      }
    }

    await this.loadingSync.dismiss();
  }

  async editFrequency(
    unityId: number,
    classroomId: number,
    stringDate: string,
    disciplineId: number,
    classes: number[],
  ) {
    const globalAbsence = !disciplineId;

    this.loadingSync = await this.loadingCtrl.create({
      message: 'Carregando...',
    });

    await this.loadingSync.present();

    this.auth.currentUser().subscribe((user) => {
      this.dailyFrequencyService
        .getStudents({
          userId: user.id,
          teacherId: user.teacher_id,
          unityId: unityId,
          classroomId: classroomId,
          frequencyDate: stringDate,
          disciplineId: disciplineId,
          classNumbers: classes ? classes.join() : '',
        })
        .subscribe({
          next: (result: any) => {
            const navigationExtras = {
              queryParams: {
                global: globalAbsence,
              },
              state: {
                result,
              },
            };

            this.router.navigate(
              ['/students-frequency-edit'],
              navigationExtras,
            );
          },
          complete: () => this.loadingSync.dismiss(),
        });
    });
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: async () => await this.refreshLastFrequencyDays(),
    });
  }
}
