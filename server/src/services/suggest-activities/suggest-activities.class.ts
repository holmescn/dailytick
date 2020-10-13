import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface Bucket {
  bucket: number,
  activities: {
    text: string,
    freq: number
  }[]
}

export class SuggestActivities extends Service {
  app: Application;
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  find (params: Params): Promise<any> {
    if (params.query?.now) {
      const bucket = this.timeBucket(params.query.now);
      return this.activitiesInBucket(params, bucket);
    }

    return super.find(Object.assign(params, {
      query: Object.assign(params?.query, {
        userId: params.user._id
      })
    }));
  }

  create(data: Partial<any>, params: Params): Promise<any> {
    return super.create(Object.assign(data, {
      userId: params.user._id
    }), params);
  }

  async activitiesInBucket(params: Params, bucket: number): Promise<string[]> {
    const found: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        bucket,
      }
    });

    if (found.length > 0) {
      const activities = found[0].activities;
      return activities!.sort(
        (a: any, b: any) => a.freq - b.freq
      ).map(v => v.text);
    }

    return await this.refresh(params, bucket);
  }

  async refresh(params: Params, bucket: number): Promise<string[]> {
    const ticks: any[] = await this.app.service('ticks')._find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: 0 },
        $sort: { tickTime: 1 },
        $select: ['activity', 'tickTime']
      }
    });

    const m = new Map<number, any[]>();
    for(const tick of ticks) {
      const b = this.timeBucket(tick.tickTime);
      if (m.has(b)) {
        const activities = m.get(b);
        const index = activities!.findIndex((t: any) => t.text === tick.activity);
        if (index < 0) {
          activities!.push({ text: tick.activity, freq: 1 });
        } else {
          activities![index].freq += 1;
        }
        m.set(b, activities!);
      } else {
        m.set(b, [{ text: tick.activity, freq: 1 }]);
      }
    }

    for (const key of m.keys()) {
      const activities = m.get(key);
      await this._patch(null, {
        bucket: key,
        activities: { $set: activities! }
      }, {
        ...params,
        provider: undefined,
        nedb: { upsert: true }
      });
    }

    if (m.has(bucket)) {
      const activities = m.get(bucket);
      return activities!.sort(
        (a: any, b: any) => a.freq - b.freq
      ).map(v => v.activity);
    }
    return [];
  }

  timeBucket(ts: number, roundTo=10): number {
    const t = new Date(ts);
    const minutes = t.getUTCHours() * 60 + t.getUTCMinutes();
    return minutes - minutes % roundTo;
  }
}
