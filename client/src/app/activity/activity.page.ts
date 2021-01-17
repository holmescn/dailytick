import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { tick } from '@angular/core/testing';
import { IonInput, ModalController } from '@ionic/angular';
import { Tick } from '../interfaces/tick';
import { FeathersService } from '../services/feathers.service';

interface Suggest {
  text: string,
  checked?: boolean
}

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
  inputText: string;
  listHeader: string;
  suggests: Suggest[] = [];

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
      this.listHeader = '选择活动';
    } else {
      const tick = this.ticks.find(t => t._id === this.tickId);
      this.tick = {
        ...tick,
        tags: [...tick.tags]
      };
      this.listHeader = '选择标签';
      this.suggests = await this.loadSuggestTags();
      this.checkTags(this.suggests, this.tick.tags);
    }
    this.inputText = this.formatText(this.tick);
  }

  async loadSuggestActivities(): Promise<Suggest[]> {
    const { data: suggestsByTime } = await this.feathers.service('suggest-activities').find({
      query: {
        now: Date.now()
      }
    });

    const suggests: Suggest[] = suggestsByTime.map(a => Object.assign({ text: a }));

    for (let i = 0; i < Math.min(10, this.ticks.length); ++i) {
      const tick = this.ticks[i];
      const index = suggests.findIndex(a => a.text === tick.activity);
      if (index < 0) {
        suggests.push({
          text: tick.activity
        });
      }
    }

    return suggests;
  }

  async loadSuggestTags(): Promise<Suggest[]> {
    const suggests: Suggest[] = [];

    const { data: tags } = await this.feathers.service('activity-tags').find({
      query: {
        activity: this.tick.activity
      }
    });

    for (const tag of tags) {
      suggests.push({
        text: tag,
        checked: false
      });
    }

    for (const item of suggests) {
      if (this.tick.tags.indexOf(item.text) < 0) {
        this.tick.tags.push(item.text);
      }
    }

    const { data: frequent } = await this.feathers.service('tags').find({
      query: {
        $sort: { freq: -1 },
        $limit: 10,
        $select: ['tag']
      }
    });

    for (const item of frequent) {
      const index = suggests.findIndex(s => s.text === item.tag);
      if (index < 0) {
        suggests.push({
          text: item.tag,
          checked: false
        });
      }
    }

    for (let i = 0; i < Math.min(10, this.ticks.length); ++i) {
      const tick = this.ticks[i];
      for (const tag of tick.tags) {
        const index = suggests.findIndex(s => s.text === tag);
        if (index < 0) {
          suggests.push({
            text: tag,
            checked: false
          });
        }
      }
    }

    return suggests;
  }

  formatText(tick: Tick): string {
    if (tick.tags.length > 0) {
      const tags = tick.tags.join(' #');
      return `${tick.activity} #${tags}`;
    } else {
      return tick.activity;
    }
  }

  extractTick(text: string): string {
    const tags: string[] = [];
    const activity = text.replace(/#[^#]+(\s+|$)/g, (tag: string) => {
      tags.push(tag.substring(1).trim());
      return '';
    }).trim();

    this.tick.tags = tags.filter(t => t.length > 0);
  
    return activity;    
  }

  async onBlur(event: CustomEvent) {
    const activity = this.extractTick(this.inputText);
    if (activity.length > 0) {
      this.listHeader = '选择标签';
      this.tick.activity = activity;
      this.suggests = await this.loadSuggestTags();
      this.checkTags(this.suggests, this.tick.tags);
    } else {
      this.listHeader = '选择活动';
      this.suggests = await this.loadSuggestActivities();
    }

    this.inputText = this.formatText(this.tick);
  }

  async onChange(event: CustomEvent) {
    const value = event.detail.value;
    this.inputText = value;
  }

  async onClickItem(item: string) {
    if (this.tick.activity === '') {
      await this.clickActivity(item);
    } else {
      this.toggleTag(item);
    }
  }

  async clickActivity(activity: string) {
    this.listHeader = '选择标签';
    this.tick.activity = activity;
    this.suggests = await this.loadSuggestTags();
    this.checkTags(this.suggests, this.tick.tags);
    this.inputText = this.formatText(this.tick);
  }

  toggleTag(tag: string) {
    const index = this.tick.tags.indexOf(tag);
    const item = this.suggests.find(s => s.text === tag);
    if (index < 0) {
      this.tick.tags.push(tag);
      item.checked = true;
    } else {
      this.tick.tags.splice(index, 1);
      item.checked = false;
    }

    this.inputText = this.formatText(this.tick);
  }

  checkTags(suggests: Suggest[], tags: string[]) {
    for (const item of suggests) {
      item.checked = tags.indexOf(item.text) >= 0;
    }
  }

  onOk(event: Event) {
    this.tick.activity = this.extractTick(this.inputText);
    this.modal.dismiss({ action: 'ok', activity: this.tick.activity, tags: this.tick.tags });
  }

  onCancel(event: Event) {
    this.modal.dismiss({ action: 'cancel' });
  }
}
