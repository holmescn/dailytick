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

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonVirtualScroll) virtualScroll: IonVirtualScroll;
  @ViewChild(IonDatetime) datetimeCtl: IonDatetime;

  constructor(private modal: ModalController,
              private alert: AlertController,
              private feathers: FeathersService,
              private formatter: FormatterService) {
    this.service = this.bindServiceEvents();
  }

  bindServiceEvents() {
    const service = this.feathers.service("ticks");
    service.on('created', (tick: Tick) => {
      const index = this.ticks.findIndex(t => t.tickTime < tick.tickTime);
      const _tick = this.formatTick(tick, index, this.ticks);
      if (index < 0) {
        this.ticks.unshift(_tick);
        this.virtualScroll.checkRange(0, 2);
      } else {
        this.ticks.splice(index, 0, _tick);
        this.virtualScroll.checkRange(0, 2);
      }
      // this.virtualScroll.checkRange(0, this.ticks.length);
    });
    service.on('updated', (tick: Tick) => {
      const index = this.ticks.findIndex(_tick => _tick._id === tick._id);
      if (index >= 0) {
        this.ticks[index] = this.formatTick(tick, index, this.ticks);
        this.virtualScroll.checkRange(index, 1);
      }
    });
    service.on('patched', (tick: Tick) => {
      const index = this.ticks.findIndex(_tick => _tick._id === tick._id);
      if (index >= 0) {
        this.ticks[index] = this.formatTick(tick, index, this.ticks);
        this.virtualScroll.checkRange(index, 1);
      }
    });
    service.on('removed', (tick: Tick) => {
      this.ticks = this.ticks.filter(t => t._id !== tick._id);
    });
    return service;
  }

  formatTick(tick: Tick, index: number, ticks: Tick[]): Tick {
    const _endTime = index <= 0 ? Date.now() : ticks[index-1].tickTime;
    return Object.assign(tick, {
      _date: this.formatter.date(tick.tickTime),
      _time: this.formatter.time(tick.tickTime),
      _duration: this.formatter.duration(_endTime - tick.tickTime),
      _tagsText: tick.tags.length > 0 ? `#${tick.tags.join(' #')}` : ''
    });
  }

  async showModal(tickId: string) {
    const modal = await this.modal.create({
      component: ActivityPage,
      backdropDismiss: false,
      componentProps: {
        tickId,
        ticks: this.ticks
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

    const tickTime = afterTick ? afterTick.tickTime+1000 : Date.now();
    const data = await this.showModal('new');
    if (data.action === 'ok') {
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

      const data = await this.showModal(tick._id);
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

  async loadData(tickTime: number) {
    const query: any = {
      tickTime: { $lt: tickTime },
      $sort: { tickTime: -1 },
      $limit: this.itemsPerPage,
    };

    const { data } = await this.service.find({ query });
    return data;
  }

  async loadMore(event) {
    // load more data
    const ticks = await this.loadData(this.ticks[this.ticks.length-1].tickTime);
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
    const ticks = await this.loadData(Date.now());
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
      const tMin = this.ticks[Math.min(index+1, this.ticks.length-1)].tickTime;
      const tMax = index === 0 ? Date.now() : this.ticks[index-1].tickTime;

      const dMin = this.formatter.toISOString(tMin).substr(0, 10);
      const dMax = this.formatter.toISOString(tMax).substr(0, 10);

      this.editingMinTickTime = `${dMin}T00:00:00Z`;
      this.editingMaxTickTime = `${dMax}T23:59:59Z`;

      if (dMax === dMin) {
        this.pickerFormat = "hh:mm:ss A";
      } else if (dMax.substr(0, 7) === dMin.substr(0, 7)) {
        this.pickerFormat = "DD hh:mm:ss A";
      } else {
        this.pickerFormat = "MM/DD hh:mm:ss A";
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
      const d = new Date();
      const M = d.getMonth() + 1;
      const D = d.getDate();
      const MM = M < 10 ? `0${M}` : M;
      const DD = D < 10 ? `0${D}` : D;
      const today = `${d.getFullYear()}-${MM}-${DD}`;
      return record._date === today ? '今天' : record._date;
    }
    return null;
  }

  trackByFn(index: number, item: Tick) {
    return item._id || item.tickTime;
  }

  ngOnInit() {
    this.loadData(Date.now()).then((ticks: Tick[]) => {
      this.ticks = ticks.map(this.formatTick.bind(this));
    });

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
          this.ticks[0]._duration = `${h}h ${m}m`;
        } else {
          this.title = `${mm}:${ss}`;
          this.ticks[0]._duration = `${m}m ${s}s`;
        }
      }
    }, 1000);
  }

  ngOnDestroy() {
    window.clearInterval(this.timer);
  }
}
