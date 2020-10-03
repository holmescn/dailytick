import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabRecordPage } from './tab_record.page';

import { TabRecordPageRoutingModule } from './tab_record-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabRecordPageRoutingModule
  ],
  declarations: [TabRecordPage]
})
export class Tab1PageModule {}
