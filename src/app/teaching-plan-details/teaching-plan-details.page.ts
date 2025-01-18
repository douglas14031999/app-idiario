import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../services/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-teaching-plan-details',
  templateUrl: './teaching-plan-details.page.html',
  styleUrls: ['./teaching-plan-details.page.scss'],
  standalone: false,
})
export class TeachingPlanDetailsPage implements OnInit {
  teachingPlanId!: number;
  description!: string;
  unity_name!: string;
  period!: string;
  objectives: any[] = [];
  activities!: string;
  evaluation!: string;
  bibliography!: string;
  contents: any[] = [];
  knowledge_areas!: any;
  year!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private utilsService: UtilsService,
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.teachingPlanId = +id;
    } else {
      console.error('ID não encontrado na rota');
    }

    this.storage.get('teachingPlans').then((teachingPlans) => {
      const details = this.getTeachingPlanDetail(teachingPlans);

      if (details) {
        this.description = `${details.description} - ${details.grade_name}`;
        this.unity_name = details.unity_name;
        this.period = details.period;
        this.contents = details.contents || [];
        this.knowledge_areas = details.knowledge_areas;
        this.year = details.year;
        this.objectives = details.objectives || [];
        this.evaluation = this.utilsService.convertTextToHtml(
          details.evaluation,
        );
        this.bibliography = this.utilsService.convertTextToHtml(
          details.bibliography,
        );
        this.activities = this.utilsService.convertTextToHtml(
          details.activities,
        );
      }
    });
  }

  // TODO refactor
  // A estrutura de armazenamento em localstorage está péssima, deve ser
  // problemas da atualização do Rails e precisa ser modificada.
  getTeachingPlanDetail(teachingPlans: any[]): any {
    return teachingPlans
      .map((a) => a.unities.flatMap((b: any) => b.plans))
      .flatMap((c) => c)
      .find((plan) => plan.id === this.teachingPlanId);
  }

  goBack() {
    this.router.navigate(['/tabs/tab4']);
  }
}
