import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SyncProvider } from '../services/sync';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  unities: any[] = [];

  constructor(
    private navCtrl: NavController,
    private sync: SyncProvider,
    private storage: StorageService,
  ) {}
  ngOnInit(): void {
    this.updateLessonPlans();
  }

  async ionViewWillEnter() {
    // Atualizado para ionViewWillEnter
    await this.updateLessonPlans();
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: () => this.updateLessonPlans(),
    });
  }

  async updateLessonPlans() {
    try {
      const lessonPlans = await this.storage.get('lessonPlans');
      if (!lessonPlans) return;
      this.unities = [];

      // TODO verificar
      // O objeto armazenado em localStorage é uma array de objetos com a chave `content_records`, possivelmente é um
      // efeito colateral da mudança da versão do Rails.
      const all = lessonPlans.flatMap(
        (result: { unities: any }) => result.unities,
      );

      all.forEach((unity: { plans: any[]; unity_name: any }) => {
        if ((unity.plans || []).length === 0) {
          return;
        }

        const lessonPlans = unity.plans.map((plan) => ({
          id: plan.id,
          description: `${plan.description} - ${plan.classroom_name}`,
        }));

        this.unities.push({ name: unity.unity_name, lessonPlans });
      });
    } catch (error) {
      console.error('Error updating lesson plans:', error);
    }
  }

  openDetail(lessonPlanId: number) {
    // Ajustado para tipagem adequada
    this.navCtrl.navigateForward('/lesson-plan-details', {
      state: { lessonPlanId },
    }); // Atualizado para navigateForward
  }
}
