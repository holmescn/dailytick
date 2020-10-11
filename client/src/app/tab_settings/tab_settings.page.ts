import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-tab_settings',
  templateUrl: 'tab_settings.page.html',
  styleUrls: ['tab_settings.page.scss']
})
export class TabSettingsPage {
  darkTheme: boolean;
  constructor(private feathers: FeathersService) {
    const theme = localStorage.getItem('theme');
    this.darkTheme = theme === 'dark';
  }

  changeTheme(event) {
    if (event.detail.checked) {
      localStorage.setItem('theme', 'dark');
      document.body.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.body.classList.remove('dark');
    }
    this.darkTheme = event.detail.checked;
  }

  async exportDailyDetails(event: CustomEvent) {
    const response = await this.feathers.service("export-csv").get('daily-details');
    console.log(response);
    if (response.code === 0) {
      const url = (environment.production
                  ? `${environment.serverUrl}/download/${response.filename}`
                  : `${environment.serverUrl}/${response.filename}`);
      window.open(url, '_blank');
    }
  }
}
