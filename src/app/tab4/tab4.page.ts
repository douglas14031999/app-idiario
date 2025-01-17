import { Component, OnInit } from '@angular/core';
import { SyncProvider } from '../services/sync';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  unities: any[] = [];

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private storage: StorageService,
  ) {}
  ngOnInit(): void {
    this.updateTeachingPlans();
  }

  ionViewDidLoad() {
    this.updateTeachingPlans();
  }

  doRefresh() {
    this.sync.execute().subscribe({
      next: () => this.updateTeachingPlans(),
    });
  }

  async updateTeachingPlans() {
    const teachingPlans = await this.storage.get('teachingPlans');

    if (!teachingPlans) return;

    // TODO verificar
    // O objeto armazenado em localStorage é uma array de objetos com a chave `content_records`, possivelmente é um
    // efeito colateral da mudança da versão do Rails.
    const all = teachingPlans.flatMap(
      (result: { unities: any }) => result.unities,
    );

    this.unities = all.map((unity: { plans: any[]; unity_name: any }) => {
      const teachingPlans = unity.plans.map((plan) => ({
        id: plan.id,
        description: `${plan.description} - ${plan.grade_name}`,
      }));
      return { name: unity.unity_name, teachingPlans: teachingPlans };
    });
  }

  // Atualize o método openDetail
  openDetail(teachingPlanId: number) {
    this.router.navigate(['/teaching-plan-details', teachingPlanId]);
  }
}
