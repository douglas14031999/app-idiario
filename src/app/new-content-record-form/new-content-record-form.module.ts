import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewContentRecordFormPage } from './new-content-record-form.page';
import { NewContentRecordFormPageRoutingModule } from './new-content-record-form-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewContentRecordFormPageRoutingModule,
  ],
  declarations: [NewContentRecordFormPage],
})
export class NewContentRecordFormPageModule {}
