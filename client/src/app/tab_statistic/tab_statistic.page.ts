import { Component, OnInit } from '@angular/core';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-tab_statistic',
  templateUrl: 'tab_statistic.page.html',
  styleUrls: ['tab_statistic.page.scss']
})
export class TabStatisticPage implements OnInit {
  segment: string = "today";
  data: any;

  constructor(private feathers: FeathersService) {

  }

  segmentChanged(event) {
    this.segment = event.detail.value;
    if (this.segment === 'custom') {
      //
    } else {
      this.loadData(this.segment);
    }
  }

  ngOnInit() {
    this.loadData(this.segment);
  }

  loadData(type: string) {
    this.feathers.service('ticks').find({
      query: { tickTime: type, now: Date.now() }
    }).then((data: any) => {
      this.data = data;
      console.log(data);
    });
  }
}
