import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  @Input() readonly tickId: string;
  @Input() readonly ticks: Tick[];

  activity: string;
  tags: string[];
  inputText: string;
  segment = "activities";
  suggests: Suggest[];
  subject = new Subject();
  token: any;

  constructor(private modal: ModalController, private feathers: FeathersService) {
    this.token = null;
  }

  ngOnInit() {
    this.subject.pipe(
      debounceTime(1000),
    ).subscribe((text: string) => {
      this.loadSuggests(text).then(suggests => {
        if (suggests instanceof Array) {
          this.suggests = suggests;
        }
      });
    });

    if (this.tickId === 'new') {
      this.activity = '';
      this.tags = [];
      this.segment = "activities";
    } else {
      const tick = this.ticks.find(t => t._id === this.tickId);
      this.activity = tick.activity;
      this.tags = [...tick.tags];
      this.segment = "tags";
    }

    this.updateInput(this.activity, this.tags);
    window.setTimeout(() => {
      this.subject.next(this.inputText);
    }, 100);
  }

  async loadSuggests(text: string): Promise<Suggest[] | void> {
    // console.log(`loadSuggests: ${text}`);

    let cancelled = false;
    this.token = {
      cancel: () => {
        cancelled = true;
        console.log(`cancel: ${text}`);
      }
    };

    if (cancelled) return;
    if (text === '') {
      const suggests = await this.loadSuggestActivities();
      if (cancelled) return;
      this.segment = "activities";
      return suggests;
    } else {
      const tick = this.extractTick(text);
      if (cancelled) return;
      const suggests = await this.loadSuggestTags(tick);
      if (cancelled) return;
      this.segment = 'tags';
      this.activity = tick.activity;
      this.tags = [...tick.tags];
      this.checkTags(suggests, tick.tags);
      this.updateInput(this.activity, this.tags);
      return suggests;
    }
  }

  async loadSuggestActivities(): Promise<Suggest[]> {
    const { data: suggestsByTime } = await this.feathers.service('suggest-activities').find({
      query: {
        now: Date.now()
      }
    });

    const suggests: Suggest[] = suggestsByTime.map(a => Object.assign({ text: a }));

    for (const tick of this.ticks) {
      const index = suggests.findIndex(a => a.text === tick.activity);
      if (index < 0) {
        suggests.push({
          text: tick.activity
        });
      }
    }

    return suggests;
  }

  async loadSuggestTags(tick: Tick): Promise<any> {
    const suggests: Suggest[] = [];

    const { data: tags } = await this.feathers.service('activity-tags').find({
      query: {
        activity: tick.activity
      }
    });

    for (const tag of tags) {
      suggests.push({
        text: tag,
        checked: false
      });
    }

    for (const item of suggests) {
      if (tick.tags.indexOf(item.text) < 0) {
        tick.tags.push(item.text);
      }
    }

    const { data: frequent } = await this.feathers.service('tags').find({
      query: {
        $sort: { freq: -1 },
        $limit: 20,
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

  updateInput(activity: string, tags: string[]): void {
    // console.log(`updateText: ${activity}, ${tags.join(',')}`);
    if (tags.length > 0) {
      const tagsStr = tags.join(' #');
      this.inputText = `${activity} #${tagsStr}`;
    } else {
      this.inputText = activity;
    }
  }

  extractTick(text: string): Tick {
    const tags: string[] = [];
    const activity = text.replace(/#[^#]+(\s+|$)/g, (tag: string) => {
      tags.push(tag.substring(1).trim());
      return '';
    }).trim();

    return {
      _id: '',
      activity,
      tags,
      tickTime: 0
    }
  }

  async onInputChange(event: CustomEvent) {
    const text = event.detail.value;
    if (this.token) {
      this.token.cancel();
    }
    this.subject.next(text);
  }

  async onSegmentChange(event: CustomEvent) {
    const sel = event.detail.value;
    if (sel === 'tags') {
      if (this.activity === '') {
        this.segment = 'activities';
      } else {
        const tick = {
          _id: '',
          activity: this.activity,
          tags: this.tags,
          tickTime: 0
        };
        this.suggests = await this.loadSuggestTags(tick);
        this.tags = [...tick.tags];
        this.checkTags(this.suggests, tick.tags);
        this.segment = 'tags';
      }
    } else {
      this.suggests = await this.loadSuggestActivities();
      this.segment = 'activities';
    }
  }

  onClickItem(item: string) {
    if (this.segment === 'activities') {
      this.clickActivity(item);
    } else {
      this.toggleTag(item);
    }
  }

  async clickActivity(activity: string) {
    this.activity = activity;
    this.inputText = activity;
    this.tags = [];
    this.subject.next(activity);
  }

  toggleTag(tag: string) {
    const index = this.tags.indexOf(tag);
    const item = this.suggests.find(s => s.text === tag);
    if (index < 0) {
      this.tags.push(tag);
      item.checked = true;
    } else {
      this.tags.splice(index, 1);
      item.checked = false;
    }

    this.updateInput(this.activity, this.tags);
  }

  checkTags(suggests: Suggest[], tags: string[]) {
    for (const item of suggests) {
      item.checked = tags.indexOf(item.text) >= 0;
    }
  }

  onOk() {
    this.modal.dismiss({ action: 'ok', activity: this.activity, tags: this.tags });
  }

  onCancel() {
    this.modal.dismiss({ action: 'cancel' });
  }
}
