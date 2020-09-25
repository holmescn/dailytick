import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FullEditPageRoutingModule } from './full-edit-routing.module';

import { FullEditPage } from './full-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FullEditPageRoutingModule
  ],
  declarations: [FullEditPage]
})
export class FullEditPageModule {}
