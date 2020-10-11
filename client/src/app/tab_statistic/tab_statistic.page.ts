import { Component, OnInit } from '@angular/core';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-tab_statistic',
  templateUrl: 'tab_statistic.page.html',
  styleUrls: ['tab_statistic.page.scss']
})
export class TabStatisticPage implements OnInit {
  // time: string = "today";
  time: string = "this-week";
  items: any[] = [];
  activityS: any[] = [];
  tagS: any[] = [];

  constructor(private feathers: FeathersService) {

  }

  onSelectChanged(event: CustomEvent) {
    this.time = event.detail.value;
    if (this.time === 'custom') {
      //
    } else {
      this.loadData(this.time);
    }
  }

  ngOnInit() {
    this.loadData(this.time);
  }

  loadData(type: string) {
    this.feathers.service('ticks').find({
      query: { tickTime: type, now: Date.now() }
    }).then((items: any[]) => {
      this.items = this.addDuration(items);
      this.activityS = this.activityStatistic(this.items);
      this.tagS = this.tagStatistic(this.items);
    }).catch(console.error);
  }

  addDuration(data: any[]) {
    return data.map((item: any, index: number, items: any[]) => Object.assign(item, {
      duration: Math.floor(((index+1 < items.length ? items[index+1].tickTime : 0) - item.tickTime) / 1000),
    })).filter(
      (item: any) => item.duration > 0
    );
  }

  formatDuration(duration: number): string {
    const h = Math.floor(duration / 3600);
    const m = Math.floor(duration % 3600 / 60);
    const s = Math.floor(duration % 3600 % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  }

  activityStatistic(data: any[]) {
    const results: any[] = data.reduce((r: any[], item: any) => {
      const i = r.findIndex(t => t.text === item.activity.trim());
      if (i < 0) {
        r.push({
          text: item.activity.trim(),
          duration: item.duration,
          items: [{
            _id: item._id,
            activity: item.activity,
            tickTime: item.tickTime,
          }]
        });
      } else {
        r[i]['duration'] += item.duration;
        r[i]['items'].push(item);
      }
  
      r[0]['duration'] += item.duration;
      return r;
    }, [{ text: '共记', duration: 0 }]);
  
    return [...results.slice(1), results[0]];
  }

  tagStatistic(data: any[]) {
    const results: any[] = data.reduce((r: any[], item: any) => {
      item.tags.forEach((tag: string) => {
        const i = r.findIndex(t => t.text === tag.trim());
        if (i < 0) {
          r.push({
            text: tag.trim(),
            duration: item.duration,
          });
        } else {
          r[i]['duration'] += item.duration;
        }
      });
      return r;
    }, []);
    return results;
  }
}
