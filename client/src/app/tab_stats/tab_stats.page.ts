import { Component } from '@angular/core';

@Component({
  selector: 'app-tab_stats',
  templateUrl: 'tab_stats.page.html',
  styleUrls: ['tab_stats.page.scss']
})
export class TabStatsPage {
  segment: string = "today";

  constructor() {}

  segmentChanged(event) {
    this.segment = event.detail.value;
  }
}
