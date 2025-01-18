import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FrequencyPage } from './frequency.page';
import { FrequencyPageRoutingModule } from './frequency-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FrequencyPageRoutingModule],
  declarations: [FrequencyPage],
})
export class FrequencyPageModule {}
