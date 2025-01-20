import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SyncProvider } from '../services/sync';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  unities: any[] = [];

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private storage: StorageService,
  ) {}

  async ionViewWillEnter() {
    await this.updateTeachingPlans();
  }

  async updateTeachingPlans() {
    const teachingPlans = await this.storage.get('teachingPlans');
    const doesntHaveTeachingPlans = !teachingPlans;

    this.unities = [];

    if (doesntHaveTeachingPlans) {
      return;
    }

    this.unities = teachingPlans
      .flatMap((result: { unities: any }) => result.unities)
      .filter((unity: { plans: any[] }) => unity.plans?.length)
      .map((unity: { plans: any[]; unity_name: any }) => ({
        name: unity.unity_name,
        teachingPlans: unity.plans.map((plan) => ({
          id: plan.id,
          description: `${plan.description} - ${plan.grade_name}`,
        })),
      }));
  }

  async openDetail(teachingPlanId: number) {
    await this.router.navigate(['/teaching-plan-details', teachingPlanId]);
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: () => this.updateTeachingPlans(),
    });
  }
}
