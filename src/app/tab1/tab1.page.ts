import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { DailyFrequencyService } from '../services/daily_frequency';
import { GlobalFrequenciesPersisterService } from '../services/offline_data_persistence/global_frequencies_persister';
import { MessagesService } from '../services/messages';
import { StorageService } from '../services/storage.service';
import { SyncProvider } from '../services/sync';
import { UtilsService } from '../services/utils';
import { OfflineDataPersisterService } from '../services/offline_data_persistence/offline_data_persister';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  shownGroup: any = null;
  lastFrequencyDays: any = null;
  emptyFrequencies: boolean = false;
  currentDate: Date = new Date();
  frequenciesLoaded: boolean = false;
  private loadingSync!: HTMLIonLoadingElement;

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private loadingCtrl: LoadingController,
    private dailyFrequencyService: DailyFrequencyService,
    private auth: AuthService,
    private utilsService: UtilsService,
    private storage: StorageService,
    private messages: MessagesService,
    private global: GlobalFrequenciesPersisterService,
    private offlineDataPersister: OfflineDataPersisterService,
  ) {}

  async ngOnInit() {
    // this.storage.set('dailyFrequencyStudentsToSync', []);
    // const user = await this.storage.get('user');
    // const classrooms = await this.storage.get('classrooms');
    //
    // // Na primeira vez que é feita a sincronização ainda não existe dados de classrooms e é retornado null, desta forma
    // // as frequências já lançadas nunca são carregadas e precisa ser feito logout e novo login.
    //
    // if (user) {
    //   await this.global.persist(user, classrooms);
    //   this.loadFrequencies();
    //   this.frequenciesLoaded = true;
    //   await this.sync.isSyncDelayed();
    // } else {
    //   await this.router.navigate(['/sign-in']);
    // }
  }

  ionViewWillEnter() {
    // if (
    //   !this.frequenciesLoaded &&
    //   (!this.currentDate || this.router.url.includes('frequency'))
    // ) {
    //   this.loadFrequencies();
    // }
    // this.frequenciesLoaded = false;
  }

  loadFrequencies() {
    this.shownGroup = null;
    this.currentDate = this.utilsService.getCurrentDate();
    this.currentDate.setHours(0, 0, 0, 0);
    this.storage.get('frequencies').then((frequencies) => {
      if (frequencies) {
        this.lastFrequencyDays = this.lastTenFrequencies(
          frequencies.daily_frequencies,
        );
        this.emptyFrequencies = false;
      } else {
        this.emptyFrequencies = true;
        this.currentDate = new Date();
      }
    });
  }

  newFrequency() {
    this.utilsService.hasAvailableStorage().then(async (available) => {
      if (!available) {
        await this.messages.showError(
          this.messages.insuficientStorageErrorMessage(
            'lançar novas frequências',
          ),
        );
        return;
      }

      this.storage.get('unities').then((unities) => {
        this.router.navigate(['/frequency']);
      });
    });
  }

  toggleGroup(group: any) {
    this.shownGroup = this.isGroupShown(group) ? null : group;
  }

  isGroupShown(group: any) {
    return this.shownGroup === group;
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
      return null;
    }

    const unities: { id: any; name: any; classroomDisciplines: any[] }[] = [];

    frequencies.forEach((frequency) => {
      if (
        // TODO Lógica diferente
        unities.findIndex((unity) => unity.id === frequency.unity_id) === -1
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
      (frequency) => frequency.unity_id === unityId,
    );
    const classroomDisciplines: {
      classroomId: any;
      disciplineId: any;
      classroomName: any;
      disciplineName: any;
      classNumbers: any[];
    }[] = [];

    frequenciesOfUnity.forEach((frequency) => {
      // TODO Lógica diferente
      const indexOfClassroomDiscipline = classroomDisciplines.findIndex(
        (cd) =>
          cd.classroomId === frequency.classroom_id &&
          cd.disciplineId === frequency.discipline_id,
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

  loadMoreFrequencies() {
    this.utilsService.hasAvailableStorage().then(async (available) => {
      if (!available) {
        await this.messages.showError(
          this.messages.insuficientStorageErrorMessage(
            'carregar mais frequências',
          ),
        );
        return;
      }

      this.loadingSync = await this.loadingCtrl.create({
        message: 'Carregando...',
      });

      await this.loadingSync.present();

      this.storage.get('frequencies').then((frequencies) => {
        if (frequencies) {
          if (!this.lastFrequencyDays) {
            this.lastFrequencyDays = [];
          }

          const newFrequencies = this.lastTenFrequencies(
            frequencies.daily_frequencies,
          );

          if (newFrequencies.length > 0) {
            this.lastFrequencyDays =
              this.lastFrequencyDays.concat(newFrequencies);
          }
        }

        this.loadingSync.dismiss();
      });
    });
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

    this.auth.currentUser().subscribe((res) => {
      const usuario = res;

      this.dailyFrequencyService
        .getStudents({
          userId: usuario.id,
          teacherId: usuario.teacher_id,
          unityId: unityId,
          classroomId: classroomId,
          frequencyDate: stringDate,
          disciplineId: disciplineId,
          classNumbers: classes ? classes.join() : '',
        })
        .subscribe(
          (result: any) => {
            // TODO Lógica diferente
            const navigationExtras = {
              queryParams: {
                //frequencies: result,
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
          (error: any) => {
            console.log(error);
          },
          () => {
            this.loadingSync.dismiss();
          },
        );
    });
  }

  async doRefresh() {
    const user = await this.storage.get('user');

    this.offlineDataPersister.persist(user).subscribe((res) => {
      console.log(res);
    });
    // this.sync.syncAll().subscribe((res) => {
    //   this.loadFrequencies();
    // });
  }
}
