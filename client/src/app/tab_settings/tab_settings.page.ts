import { Component } from '@angular/core';

@Component({
  selector: 'app-tab_settings',
  templateUrl: 'tab_settings.page.html',
  styleUrls: ['tab_settings.page.scss']
})
export class TabSettingsPage {
  darkTheme: boolean;
  constructor() {
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
}
