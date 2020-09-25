import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullEditPage } from './full-edit.page';

const routes: Routes = [
  {
    path: '',
    component: FullEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullEditPageRoutingModule {}
