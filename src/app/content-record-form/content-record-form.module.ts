import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContentRecordFormPage } from './content-record-form.page';
import { ContentRecordFormPageRoutingModule } from './content-record-form-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentRecordFormPageRoutingModule,
  ],
  declarations: [ContentRecordFormPage],
})
export class ContentRecordFormPageModule {}
