import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface Activity {
  text: string,
  freq: number
}

interface Bucket {
  timeBucket: number,
  activities: Activity[]
}

export class SuggestActivities extends Service {
  app: Application;
  roundTo = 10;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  find (params: Params): Promise<any> {
    if (params.query?.now) {
      return this.activitiesInBucket(params, params.query.now);
    }

    return super.find(Object.assign(params, {
      query: Object.assign(params?.query, {
        userId: params.user._id
      })
    }));
  }

  sortFn(a: Activity, b: Activity): number {
    return b.freq - a.freq;
  }

  filterFn(a: Activity): boolean {
    return a.freq > 1;
  }

  mapFn(a: Activity): string {
    return a.text;
  }

  async activitiesInBucket(params: Params, now: number): Promise<string[]> {
    const bucket = this.timeBucket(now);
    const found: string[] = [];

    const f0: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        timeBucket: bucket,
        $limit: 1
      }
    });

    if (f0.length > 0) {
      const activities = f0[0].activities.filter(this.filterFn).sort(this.sortFn);
      for (const a of activities) {
        if (found.indexOf(a.text) < 0) {
          found.push(a.text);
        }
      }
    }
  
    const f1: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        timeBucket: { $lt: bucket },
        $limit: 1
      }
    });

    if (f1.length > 0) {
      const activities = f1[0].activities.filter(this.filterFn).sort(this.sortFn);
      for (const a of activities) {
        if (found.indexOf(a.text) < 0) {
          found.push(a.text);
        }
      }
    }

    const f2: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        timeBucket: { $gt: bucket },
        $limit: 1
      }
    });

    if (f2.length > 0) {
      const activities = f2[0].activities.filter(this.filterFn).sort(this.sortFn);
      for (const a of activities) {
        if (found.indexOf(a.text) < 0) {
          found.push(a.text);
        }
      }
    }

    if (found.length > 0) {
      return found;
    }

    return await this.refresh(params, bucket);
  }

  async refresh(params: Params, bucket: number): Promise<string[]> {
    const ticks: {activity: string, tickTime: number}[] = await this.app.service('ticks')._find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: 0 },
        $sort: { tickTime: 1 },
        $select: ['activity', 'tickTime']
      }
    });

    const m = new Map<number, {text: string, freq: number}[]>();
    for(const tick of ticks) {
      const timeBucket = this.timeBucket(tick.tickTime);
      if (m.has(timeBucket)) {
        const activities = m.get(timeBucket);
        if (activities) {
          const index = activities.findIndex(t => t.text === tick.activity);
          if (index < 0) {
            activities.push({ text: tick.activity, freq: 1 });
          } else {
            activities[index]['freq'] += 1;
          }
          m.set(timeBucket, activities);
        }
      } else {
        m.set(timeBucket, [{
          text: tick.activity,
          freq: 1
        }]);
      }
    }

    const db = this.getModel(params);
    for (const timeBucket of m.keys()) {
      const activities = m.get(timeBucket);
      if (activities) {
        db.update({
          timeBucket
        }, {
          $set: {
            userId: params.user._id,
            timeBucket,
            activities: activities.sort(this.sortFn)
          }
        }, {
          upsert: true
        }, (err: Error|null) => {
          if (err) console.log(err);
        });
      }
    }

    if (m.has(bucket)) {
      const activities = m.get(bucket);
      if (activities) {
        return activities.filter(this.filterFn).sort(this.sortFn).map(this.mapFn);
      }
    }
    return [];
  }

  timeBucket(ts: number): number {
    const t = new Date(ts);
    const minutes = t.getUTCHours() * 60 + t.getUTCMinutes();
    return minutes - minutes % this.roundTo;
  }
}
