import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabStatisticPage } from './tab_statistic.page';

import { TabStatisticPageRoutingModule } from './tab_statistic-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabStatisticPageRoutingModule
  ],
  declarations: [TabStatisticPage]
})
export class TabStatisticPageModule {}
