import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabRecordPage } from './tab_record.page';

const routes: Routes = [
  {
    path: '',
    component: TabRecordPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabRecordPageRoutingModule {}
