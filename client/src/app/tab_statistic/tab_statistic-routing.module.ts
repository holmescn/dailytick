import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabStatisticPage } from './tab_statistic.page';

const routes: Routes = [
  {
    path: '',
    component: TabStatisticPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabStatisticPageRoutingModule {}
