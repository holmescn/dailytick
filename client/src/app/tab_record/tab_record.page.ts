import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonInfiniteScroll,
         IonVirtualScroll,
         IonDatetime,
         AlertController,
         ModalController } from '@ionic/angular';
import { ActivityPage } from '../activity/activity.page';
import { FeathersService } from '../services/feathers.service';
import { FormatterService } from '../services/formatter.service';
import { Service } from '@feathersjs/feathers';
import { Tick } from "../interfaces/tick";
import { tick } from '@angular/core/testing';

@Component({
  selector: 'app-tab_record',
  templateUrl: 'tab_record.page.html',
  styleUrls: ['tab_record.page.scss']
})
export class TabRecordPage implements OnInit, OnDestroy {
  ticks: Tick[] = [];
  service: Service<any>;
  timer: number;
  title: string;
  editingTimer: number;
  editingTick: Tick;
  pickerFormat: string;
  editingTickTime: string;
  editingMinTickTime: string;
  editingMaxTickTime: string;
  isEditingTickTime = false;
  itemsPerPage = 25;
  today: string;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonVirtualScroll) virtualScroll: IonVirtualScroll;
  @ViewChild(IonDatetime) datetimeCtl: IonDatetime;

  constructor(private modal: ModalController,
              private alert: AlertController,
              private feathers: FeathersService,
              private formatter: FormatterService) {
    this.today = this.formatter.date(Date.now());
    this.service = this.bindServiceEvents();
  }

  bindServiceEvents() {
    const service = this.feathers.service("ticks");
    service.on('created', (tick: Tick) => {
      const index = this.ticks.findIndex(t => t.tickTime < tick.tickTime);
      this.ticks.splice(index, 0, tick);
      this.ticks = [...this.ticks].map(this.formatTick.bind(this));
    });
    service.on('updated', (tick: Tick) => {
      const index = this.ticks.findIndex(_tick => _tick._id === tick._id);
      if (index >= 0) {
        this.ticks[index] = Object.assign(this.ticks[index], this.formatTick(tick, index, this.ticks));
        this.virtualScroll.checkRange(index, 1);
      }
    });
    service.on('patched', (tick: Tick) => {
      const index = this.ticks.findIndex(_tick => _tick._id === tick._id);
      if (index >= 0) {
        this.ticks[index] = Object.assign(this.ticks[index], this.formatTick(tick, index, this.ticks));
        this.virtualScroll.checkRange(index, 1);
      }
    });
    service.on('removed', (tick: Tick) => {
      this.ticks = this.ticks.filter(t => t._id !== tick._id);
    });
    return service;
  }

  formatTick(tick: Tick, index: number, ticks: Tick[]): Tick {
    if (tick._date && tick._time && tick._duration) {
      return tick;
    }

    const _date = this.formatter.date(tick.tickTime);
    const _endTime = index <= 0 ? Date.now() : ticks[index-1].tickTime;
    return {
      ...tick,
      _date: _date === this.today ? '今天' : _date,
      _time: this.formatter.time(tick.tickTime),
      _duration: this.formatter.duration(_endTime - tick.tickTime),
      _endTime,
    };
  }

  async showModal(activity: string) {
    const modal = await this.modal.create({
      component: ActivityPage,
      backdropDismiss: false,
      componentProps: {
        activity
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    return data;
  }

  async newTick(event, afterTick?: Tick) {
    if (afterTick) {
      event.target.parentElement.parentElement.close();
    }

    const data = await this.showModal('');
    if (data.action === 'ok') {
      const tickTime = afterTick ? afterTick.tickTime+1000 : Date.now();
      const tick = {
        activity: data.activity,
        tags: data.tags,
        tickTime
      };
      await this.service.create(tick);  
    }
  }

  async editActivity(tick: Tick) {
    if (this.editingTimer) {
      window.clearTimeout(this.editingTimer);
      this.editingTimer = null;

      const tags = tick.tags.join(" #");
      const activity = `${tick.activity} #${tags}`;
      const data = await this.showModal(activity);
      if (data.action === 'ok') {
        await this.service.patch(tick._id, {
          activity: data.activity,
          tags: data.tags
        });
      }
    } else {
      this.editingTimer = window.setTimeout(() => {
        this.editingTimer = null;
      }, 250);
    }
  }

  async removeTick(event, tick) {
    event.target.parentElement.parentElement.close();
    const alert = await this.alert.create({
      header: '确定要删除',
      message: `${tick._date} ${tick._time} <br> <strong>${tick.activity}</strong>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            //
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.service.remove(tick._id);
          }
        }
      ]
    });

    await alert.present();
  }

  async loadData() {
    const query: any = {
      $sort: { tickTime: -1 },
      $limit: this.itemsPerPage,
    };
    if (this.ticks.length > 0) {
      query.tickTime = {
        $lt: this.ticks[this.ticks.length-1].tickTime
      }
    }

    const { data } = await this.service.find({ query });
    return data;
  }

  async loadMore(event) {
    console.log("loadMore");

    // load more data
    const ticks = await this.loadData();
    this.ticks = [...this.ticks, ...ticks].map(this.formatTick.bind(this));

    // Hide Infinite List Loader on Complete
    event.target.complete();

    // Rerender Virtual Scroll List After Adding New Data
    this.virtualScroll.checkEnd();

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (ticks.length < this.itemsPerPage) {
      event.target.disabled = true;
    }
  }

  async doRefresh(event) {
    this.ticks = [];
    const ticks = await this.loadData();
    this.ticks = ticks.map(this.formatTick.bind(this));
    this.infiniteScroll.disabled = false;
    event.target.complete();
  }

  async editTickTime(tick: Tick) {
    const self = this;
    if (this.editingTimer) {
      window.clearTimeout(this.editingTimer);
      this.editingTimer = null;

      if (this.editingTick._id !== tick._id) {
        return;
      }

      this.isEditingTickTime = true;
      // delay to wait for the ion-datetime show
      setTimeout(() => {
        this.datetimeCtl.open();
      }, 10);
    } else {
      this.editingTick = tick;
      this.editingTickTime = this.formatter.toISOString(tick.tickTime);
      const index = this.ticks.findIndex(t => t._id === tick._id);
      const tMax = index === 0 ? Date.now() : this.ticks[index-1].tickTime;
      const tMin = index+1 < this.ticks.length ? this.ticks[index+1].tickTime : this.ticks[index].tickTime;

      this.editingMaxTickTime = this.formatter.toISOString(tMax).substr(0, 10);
      this.editingMinTickTime = this.formatter.toISOString(tMin).substr(0, 10);

      if (this.editingMaxTickTime === this.editingMinTickTime) {
        this.pickerFormat = "HH:mm:ss+0800";
      } else {
        this.pickerFormat = "HH:mm:ss+0800";
      }

      this.editingTimer = window.setTimeout(() => {
        self.editingTimer = null;
      }, 250);
    }
  }

  changeTickTime(event) {
    const t1 = (new Date(event.detail.value)).getTime();
    const t0 = this.editingTick.tickTime;
    if (t1 > t0 || t1 < t0) {
      this.service.patch(this.editingTick._id, {
        tickTime: t1
      });
    }
    this.isEditingTickTime = false;
  }

  headerFn(record: Tick, index: number, records: Tick[]) {
    if (index === 0 || (index < records.length && record._date !== records[index-1]._date)) {
      return record._date;
    }
    return null;
  }

  trackByFn(index, item) {
    return (item && item._id) ? item._id : index;
  }

  ngOnInit() {
    this.loadData().then(ticks => this.ticks = ticks.map(this.formatTick.bind(this)));
    this.timer = window.setInterval(() => {
      if (this.ticks.length > 0) {
        const dt = (Date.now() - this.ticks[0].tickTime) / 1000;
        const h = Math.floor(dt / 3600);
        const m = Math.floor(dt % 3600 / 60);
        const s = Math.floor(dt % 3600 % 60);
        const hh = h < 10 ? `0${h}` : h;
        const mm = m < 10 ? `0${m}` : m;
        const ss = s < 10 ? `0${s}` : s;
        if (h > 0) {
          this.title = `${hh}:${mm}:${ss}`;
        } else {
          this.title = `${mm}:${ss}`;
        }
        this.ticks[0]._duration = this.formatter.duration(dt*1000);
      }
    }, 1000);
  }

  ngOnDestroy() {
    window.clearInterval(this.timer);
  }
}
