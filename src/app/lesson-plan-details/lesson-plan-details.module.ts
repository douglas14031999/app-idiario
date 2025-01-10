import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LessonPlanDetailsPage } from './lesson-plan-details.page';
import { LessonPlanDetailsPageRoutingModule } from './lesson-plan-details-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LessonPlanDetailsPageRoutingModule,
  ],
  declarations: [LessonPlanDetailsPage],
})
export class LessonPlanDetailsPageModule {}
