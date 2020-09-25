import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabStatsPage } from './tab_stats.page';

const routes: Routes = [
  {
    path: '',
    component: TabStatsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabStatsPageRoutingModule {}
