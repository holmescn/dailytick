import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabSettingsPage } from './tab_settings.page';

import { TabSettingsPageRoutingModule } from './tab_settings-routing.module'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: TabSettingsPage }]),
    TabSettingsPageRoutingModule,
  ],
  declarations: [TabSettingsPage]
})
export class TabSettingsPageModule {}
