import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { tick } from '@angular/core/testing';
import { IonInput, ModalController } from '@ionic/angular';
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
  @ViewChild(IonInput) inputBox: IonInput;

  tick: Tick;
  suggests: string[] = [];

  constructor(private modal: ModalController, private feathers: FeathersService) { }

  async ngOnInit() {
    if (this.tickId === 'new') {
      this.tick = {
        _id: 'new',
        activity: '',
        tags: [],
        tickTime: 0
      }
      this.suggests = await this.loadSuggestActivities();
    } else {
      const tick = this.ticks.find(t => t._id === this.tickId);
      this.tick = {
        ...tick,
        tags: [...tick.tags]
      };
      this.suggests = await this.loadSuggestTags();
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
    const suggests: string[] = [];
    const s = await this.feathers.service('activity-tags').find({
      query: {
        activity: this.tick.activity
      }
    });
    Array.prototype.push.apply(suggests, s.tags);

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
    const value = event.detail.value;
    const tags: string[] = [];
    const activity = value.replace(/#[^#]+(\s+|$)/g, (tag: string) => {
      tags.push(tag.substring(1).trim());
      return '';
    }).trim();
    if (this.tick.activity !== activity) {
      this.suggests = await this.loadSuggestTags();
    }
    this.tick.tags = tags.filter(t => t.length > 0);
    this.tick.activity = activity;
    await this.inputBox.setFocus();
  }

  clickActivity(activity: string) {
    this.tick.activity = activity;
    this.loadSuggestTags().then(tags => {
      this.suggests = tags;
    }).finally(() => {
      this.inputBox.setFocus();
    });
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
