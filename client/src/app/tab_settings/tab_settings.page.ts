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

  async exportDailyDetailsCSV(_event: CustomEvent) {
    const response = await this.feathers.service("export-data").get('daily-details-csv');
    // console.log(response);
    if (response.code === 0) {
      const url = (environment.production
                  ? `${environment.serverUrl}/download/${response.filename}`
                  : `${environment.serverUrl}/${response.filename}`);
      this.download(url, response.filename);
    }
  }

  async exportDailyDetailsJSON(_event: CustomEvent) {
    const response = await this.feathers.service("export-data").get('daily-details-json');
    // console.log(response);
    if (response.code === 0) {
      const url = (environment.production
                  ? `${environment.serverUrl}/download/${response.filename}`
                  : `${environment.serverUrl}/${response.filename}`);
      this.download(url, response.filename);
    }
  }

  download(url: string, filename: string) {
    const element = document.createElement('a');
    element.href = url;
    element.target = "_blank";
    element.download = filename.replace(/(daily-details)-[\w\d]+\.(csv|json)/, "$1.$2");
    document.body.appendChild(element);
    setTimeout(() => {
      element.click();
    }, 1000);
    setTimeout(() => {
      document.body.removeChild(element);
    }, 1000);
  }
}
