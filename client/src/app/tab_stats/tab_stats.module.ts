import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabStatsPage } from './tab_stats.page';

import { TabStatsPageRoutingModule } from './tab_stats-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabStatsPageRoutingModule
  ],
  declarations: [TabStatsPage]
})
export class TabStatsPageModule {}
