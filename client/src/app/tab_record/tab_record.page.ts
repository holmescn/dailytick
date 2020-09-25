import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonVirtualScroll, IonDatetime, ModalController } from '@ionic/angular';
import { EditPage } from '../edit/edit.page';

interface Tick {
  _id: String,
  _date: String,
  _time: string,
  _duration: string,
  startTime: number,
  activity: string,
  tags: string[]
};

@Component({
  selector: 'app-tab_record',
  templateUrl: 'tab_record.page.html',
  styleUrls: ['tab_record.page.scss']
})
export class TabRecordPage {
  timer: number = 0;
  editingStartTime = false;
  ticks: Tick[] = [];

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonVirtualScroll) virtualScroll: IonVirtualScroll;
  @ViewChild(IonDatetime) datetimeCtl: IonDatetime;

  constructor(public modalController: ModalController) {
    this.getData();
  }

  editStartTime(tick) {
    const self = this;
    if (this.timer) {
      console.log("editStartTime Double");
      if (!this.editStartTime) {
        window.clearTimeout(this.timer);
      }
      this.editingStartTime = true;
      setTimeout(() => {
        console.log("open datetime popup");
        self.datetimeCtl.open().then(() => {
          self.timer = 0;
        });
      }, 250);
    } else {
      console.log("editStartTime");
      this.timer = window.setTimeout(() => {
        self.timer = 0;
      }, 200);
    }
  }

  changeStartTime(event) {
    console.log(event);
    this.editingStartTime = false;
  }

  async newTick(event) {
    const modal = await this.modalController.create({
      component: EditPage,
      backdropDismiss: false,
      componentProps: {
        'type': 'new'
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log(data);
  }

  pad(x: number, size: number=2): string {
    var s = String(x);
    while (s.length < size) {s = "0" + s;}
    return s;
  }

  formatTime(tick) {
    const t = new Date(tick.startTime);
    const Y = t.getFullYear();
    const m = this.pad(t.getMonth());
    const d = this.pad(t.getDate());
    const H = this.pad(t.getHours());
    const M = this.pad(t.getMinutes());
    tick._date = `${Y}-${m}-${d}`;
    tick._time = `${H}:${M}`;
  }

  headerFn(record, recordIndex, records) {
    if (recordIndex === 0 || record._date !== records[recordIndex-1]._date) {
      return record._date;
    }
    return null;
  }

  getData() {
    const startTime = Date.now();
    const len = this.ticks.length;
    for (let i = 0; i < 20; i++) {
      const tick = {
        _id: `id-${i+len}`,
        _date: '',
        _time: '',
        _duration: '10h 10m',
        startTime: startTime + Math.floor(Math.random() * 1000 * 86400),
        activity: 'dailytick v2',
        tags: ["工作", "标签"],
      };
      this.formatTime(tick);
      this.ticks.push(tick);
    }
  }

  loadData(event) {
    console.log("loadData");

    // Using settimeout to simulate api call 
    setTimeout(() => {

      // load more data
      this.getData()

      // Hide Infinite List Loader on Complete
      event.target.complete();

      // Rerender Virtual Scroll List After Adding New Data
      this.virtualScroll.checkEnd();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.ticks.length === 1000) {
        event.target.disabled = true;
      }
    }, 500);
  }

  toggleInfiniteScroll() {
    console.log("toggleInfiniteScroll");
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      this.ticks = [];
      this.getData();
      event.target.complete();
    }, 1000);
  }
}
