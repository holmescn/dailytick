import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabStatsPage } from './tab_stats.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { TabStatsPageRoutingModule } from './tab_stats-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    TabStatsPageRoutingModule
  ],
  declarations: [TabStatsPage]
})
export class TabStatsPageModule {}
