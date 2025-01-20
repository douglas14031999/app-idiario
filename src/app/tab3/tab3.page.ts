import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    private router: Router,
    private sync: SyncProvider,
    private storage: StorageService,
  ) {}

  async ionViewWillEnter() {
    await this.updateLessonPlans();
  }

  async updateLessonPlans() {
    const lessonPlans = await this.storage.get('lessonPlans');
    const doesntHaveLessonPlans = !lessonPlans;

    this.unities = [];

    if (doesntHaveLessonPlans) {
      return;
    }

    this.unities = lessonPlans
      .flatMap((result: { unities: any }) => result.unities)
      .filter((unity: { plans: any[]; unity_name: any }) => unity.plans?.length)
      .map((unity: { plans: any[]; unity_name: any }) => ({
        name: unity.unity_name,
        lessonPlans: unity.plans.map((plan) => ({
          id: plan.id,
          description: `${plan.description} - ${plan.classroom_name}`,
        })),
      }));
  }

  async openDetail(lessonPlanId: number) {
    await this.router.navigate(['/lesson-plan-details', lessonPlanId]);
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: () => this.updateLessonPlans(),
    });
  }
}
