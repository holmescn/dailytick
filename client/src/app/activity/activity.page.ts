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

    const frequent: any[] = await this.feathers.service('tags').find({
      query: {
        $sort: { freq: -1 },
        $limit: 10,
        $select: ['tag']
      }
    });

    for (const tag of frequent) {
      if (suggests.indexOf(tag) < 0) {
        suggests.push(tag);
      }
    }

    for (let i = 0; i < Math.min(10, this.ticks.length); ++i) {
      const tick = this.ticks[i];
      for (const tag of tick.tags) {
        if (suggests.indexOf(tick.activity) < 0) {
          suggests.push(tick.activity);
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

  onChange(event: any) {
    const value = event.detail.value;
    const tags: string[] = [];
    const activity = value.replace(/#[^#]+(\s+|$)/g, (tag) => {
      tags.push(tag.substring(1).trim());
      return '';
    }).trim();
    if (this.tick.activity !== activity) {
      this.loadSuggestTags().then(tags => {
        this.suggestTags = tags;
      });
    }
    this.tick.tags = tags;
    this.tick.activity = activity;
  }

  clickActivity(activity: string) {
    if (this.dblclickTimer) {
      window.clearTimeout(this.dblclickTimer);
      this.dblclickTimer = 0;
      this.tick.activity = activity;
      this.tick.tags = [];
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
