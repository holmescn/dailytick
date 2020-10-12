import { Component, Input, OnInit } from '@angular/core';
import { tick } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { Tick } from '../interfaces/tick';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {
  @Input() tickId: string;
  @Input() ticks: Tick[];

  tick: Tick;
  disableInput = false;
  dblclickTimer: number = 0;
  suggestTags: string[] = [];
  suggestActivities: string[] = [];

  constructor(private modal: ModalController, private feathers: FeathersService) { }

  async ngOnInit() {
    if (this.tickId === 'new') {
      this.tick = {
        _id: 'new',
        activity: '',
        tags: [],
        tickTime: 0
      }
      this.suggestActivities = await this.loadSuggestActivities();
    } else {
      this.tick = this.ticks.find(t => t._id === this.tickId);
      this.suggestTags = await this.loadSuggestTags();
    }
  }

  async loadSuggestActivities(): Promise<string[]> {
    const suggests: string[] = await this.feathers.service('suggest-activities').find({
      query: {
        now: Date.now()
      }
    });

    for (let i = 0; i < Math.min(10, this.ticks.length); ++i) {
      const tick = this.ticks[i];
      if (suggests.indexOf(tick.activity) < 0) {
        suggests.push(tick.activity);
      }
    }

    return suggests;
  }

  async loadSuggestTags(): Promise<string[]> {
    const suggests: string[] = await this.feathers.service('activity-tags').find({
      query: {
        activity: this.tick.activity
      }
    });

    if (this.tick.tags.length === 0) {
      this.tick.tags = [...suggests];
    }

    const { data: frequent } = await this.feathers.service('tags').find({
      query: {
        $sort: { freq: -1 },
        $limit: 10,
        $select: ['tag']
      }
    });

    for (const item of frequent) {
      if (suggests.indexOf(item.tag) < 0) {
        suggests.push(item.tag);
      }
    }

    for (let i = 0; i < Math.min(10, this.ticks.length); ++i) {
      const tick = this.ticks[i];
      for (const tag of tick.tags) {
        if (suggests.indexOf(tag) < 0) {
          suggests.push(tag);
        }
      }
    }

    return suggests;
  }

  text(tick: Tick): string {
    if (tick.tags.length > 0) {
      const tags = tick.tags.join(' #');
      return `${tick.activity} #${tags}`;
    } else {
      return tick.activity;
    }
  }

  async onChange(event: any) {
    this.disableInput = true;
    const value = event.detail.value;
    const tags: string[] = [];
    const activity = value.replace(/#[^#]+(\s+|$)/g, (tag: string) => {
      tags.push(tag.substring(1).trim());
      return '';
    }).trim();
    if (this.tick.activity !== activity) {
      this.suggestTags = await this.loadSuggestTags();
    }
    this.tick.tags = tags;
    this.tick.activity = activity;
    this.disableInput = false;
  }

  async clickActivity(activity: string) {
    if (this.dblclickTimer) {
      window.clearTimeout(this.dblclickTimer);
      this.dblclickTimer = 0;
      this.disableInput = true;
      this.tick.activity = activity;
      this.suggestTags = await this.loadSuggestTags();
      this.disableInput = false;
    } else {
      this.dblclickTimer = window.setTimeout(() => {
        this.dblclickTimer = 0;
      }, 250);
    }
  }

  toggleTag(tag: string) {
    const index = this.tick.tags.indexOf(tag);
    if (index >= 0) {
      this.tick.tags.splice(index, 1);
    } else {
      this.tick.tags.push(tag);
    }
  }

  tagChecked(tag: string) {
    return this.tick.tags.indexOf(tag) >= 0;
  }

  onOk(event) {
    this.modal.dismiss({ action: 'ok', activity: this.tick.activity, tags: this.tick.tags });
  }

  onCancel(event) {
    this.modal.dismiss({ action: 'cancel' });
  }
}
