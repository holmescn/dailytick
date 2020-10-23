import { Component, OnInit } from '@angular/core';
import { FeathersService } from '../services/feathers.service';

interface Tick {
  _id: string,
  activity: string,
  tags: string[],
  tickTime: number,
  duration?: number
}

interface Item {
  text: string,
  duration: number,
  ticks?: Tick[]
  _duration?: string,
}

@Component({
  selector: 'app-tab_statistic',
  templateUrl: 'tab_statistic.page.html',
  styleUrls: ['tab_statistic.page.scss']
})
export class TabStatisticPage implements OnInit {
  time: string = "today";
  ticks: Tick[] = [];
  items: Item[] = [];
  segment: string = 'activities';

  constructor(private feathers: FeathersService) {

  }

  async ngOnInit() {
    this.ticks = await this.loadData(this.time);
    this.updateItems();
  }

  updateItems() {
    if (this.segment === 'tags') {
      this.items = this.tagStatistic(this.ticks);
    } else {
      this.items = this.activityStatistic(this.ticks);
    }
  }

  segmentChanged(event) {
    this.segment = event.detail.value;
    this.updateItems();
  }

  async onSelectChanged(event: CustomEvent) {
    this.time = event.detail.value;
    if (this.time === 'custom') {
      //
    } else {
      this.ticks = await this.loadData(this.time);
      this.updateItems();
    }
  }

  async loadData(type: string): Promise<Tick[]> {
    const { startTime, endTime } = this.getTimeRange(type, Date.now());
    const ticks: Tick[] = await this.feathers.service('ticks').get('time-range', {
      query: {
        startTime,
        endTime
      }
    });
    return this.addDuration(ticks);
  }

  addDuration(ticks: Tick[]): Tick[] {
    return ticks.map((tick: Tick, index: number, ticks: Tick[]) => Object.assign(tick, {
      duration: Math.floor(((index+1 < ticks.length ? ticks[index+1].tickTime : 0) - tick.tickTime) / 1000),
    })).filter(
      (tick: Tick) => tick.duration > 0
    );
  }

  formatDuration(duration: number): string {
    const h = Math.floor(duration / 3600);
    const m = Math.floor(duration % 3600 / 60);
    const s = Math.floor(duration % 3600 % 60);
    return h > 0 ? `${h}h ${m}m` : (s > 35 ? `${m+1}m` : `${m}m`);
  }

  activityStatistic(ticks: Tick[]): Item[] {
    const results: Item[] = ticks.reduce((items: Item[], tick: Tick) => {
      const index = items.findIndex(item => item.text === tick.activity);
      if (index < 0) {
        items.push({
          text: tick.activity.trim(),
          duration: tick.duration,
          ticks: [tick],
          _duration: this.formatDuration(tick.duration)
        });
      } else {
        items[index].duration += tick.duration;
        items[index]._duration = this.formatDuration(items[index].duration);
        items[index].ticks.push(tick);
      }
      items[0].duration += tick.duration;
      items[0]._duration = this.formatDuration(items[0].duration)
      return items;
    }, [{ text: '共记', duration: 0 }]);
  
    return [...results.slice(1), results[0]];
  }

  tagStatistic(ticks: Tick[]): Item[] {
    const results: Item[] = ticks.reduce((items: Item[], tick: Tick) => {
      tick.tags.forEach((tag: string) => {
        const index = items.findIndex(t => t.text === tag);
        if (index < 0) {
          items.push({
            text: tag,
            duration: tick.duration,
            ticks: [tick],
            _duration: this.formatDuration(tick.duration)
          });
        } else {
          items[index].duration += tick.duration;
          items[index]._duration = this.formatDuration(tick.duration);
          items[index].ticks.push(tick);
        }
      });
      items[0].duration += tick.duration;
      items[0]._duration = this.formatDuration(items[0].duration)
      return items;
    }, [{ text: '共记', duration: 0 }]);

    return [...results.slice(1), results[0]];
  }

  getTimeRange(type: string, now: number): any {
    const t1 = new Date(now);
    const t2 = new Date(now);
    const weekDay = t1.getDay() || 7;
    t1.setHours(0); t1.setMinutes(0); t1.setSeconds(0); t1.setMilliseconds(0);
    t2.setHours(0); t2.setMinutes(0); t2.setSeconds(0); t2.setMilliseconds(0);

    switch (type) {
    case 'today':
      t2.setDate(t2.getDate()+1);
      break;
    case 'yesterday':
      t1.setDate(t1.getDate()-1);
      break;
    case 'this-week':
      t1.setDate(t1.getDate() - (weekDay - 1));
      t2.setDate(t2.getDate() + (7 - weekDay + 1));
      break;
    case 'last-week':
      t1.setDate(t1.getDate() - (weekDay + 6));
      t2.setDate(t2.getDate() - (weekDay - 1));
      break;
    case 'this-month':
      t1.setDate(1);
      t2.setMonth(t2.getMonth()+1);
      t2.setDate(1);
      break;
    case 'last-month':
      t1.setMonth(t1.getMonth()-1);
      t1.setDate(1);
      t2.setDate(1);
      break;
    default:
      break;
    }
    return { startTime: t1.getTime(), endTime: t2.getTime() };
  }
}
