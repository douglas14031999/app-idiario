import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeachingPlanDetailsPage } from './teaching-plan-details.page';
import { TeachingPlanDetailsPageRoutingModule } from './teaching-plan-details-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeachingPlanDetailsPageRoutingModule,
  ],
  declarations: [TeachingPlanDetailsPage],
})
export class TeachingPlanDetailsPageModule {}
