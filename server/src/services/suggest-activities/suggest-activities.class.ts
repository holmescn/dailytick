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

function sortFn(a: Activity, b: Activity): number {
  return b.freq - a.freq;
}

function mapFn(a: Activity): string {
  return a.text;
}

export class SuggestActivities extends Service {
  app: Application;
  roundTo = 10;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  create(data: Partial<any>, params: Params): Promise<any> {
    if (params.type === 'upsert') {
      const db = this.getModel(params);
      const timeBucket = data.timeBucket || this.timeBucket(data.tickTime);
      return new Promise((resolve, reject) => {
        db.findOne({
          timeBucket,
          userId: params.user._id
        }, (err, doc) => {
          if (err) reject(err);
          const update: {
            $set: {
              timeBucket: number,
              userId: string,
              activities: Activity[]
            }
          } = {
            $set: {
              timeBucket,
              userId: params.user._id,
              activities: []
            }
          };

          if (doc) {
            Array.prototype.push.apply(update.$set.activities, doc.activities);
          }

          if (data.activity) {
            const index = update.$set.activities.findIndex(t => t.text === data.activity);
            if (index < 0) {
              update.$set.activities.push({
                text: data.activity,
                freq: 1
              });
            } else {
              update.$set.activities[index]['freq'] += 1;
            }
          }

          db.update({
            timeBucket,
            userId: params.user._id
          }, update, { upsert: true }, (err, numberOfUpdated) => {
            if (err) reject(err);
            resolve(numberOfUpdated);
          });
        });
      });
    }

    return super.create(Object.assign(data, {
      userId: params.user._id
    }), params);
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

  async activitiesInBucket(params: Params, now: number): Promise<string[]> {
    const bucket = this.timeBucket(now);
    const found: string[] = [];

    const query: any = {
      timeBucket: bucket,
      'activities.freq': { $gt: 1 },
      $limit: 1
    };

    const f0: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (f0.length > 0) {
      const activities = f0[0].activities.sort(sortFn);
      for (const a of activities) {
        if (found.indexOf(a.text) < 0) {
          found.push(a.text);
        }
      }
    }
  
    query.timeBucket = { $lt: bucket };
    const f1: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (f1.length > 0) {
      const activities = f1[0].activities.sort(sortFn);
      for (const a of activities) {
        if (found.indexOf(a.text) < 0) {
          found.push(a.text);
        }
      }
    }

    query.timeBucket = { $gt: bucket };
    const f2: Bucket[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (f2.length > 0) {
      const activities = f2[0].activities.sort(sortFn);
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
    const t0 = new Date();
    t0.setHours(0); t0.setMinutes(0); t0.setSeconds(0); t0.setMilliseconds(0);
    t0.setMonth(t0.getMonth() - 1); t0.setDate(1);
    const ticks: {activity: string, tickTime: number}[] = await this.app.service('ticks')._find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: t0.getTime() },
        $sort: { tickTime: 1 },
        $select: ['activity', 'tickTime']
      }
    });

    const m = new Map<number, Activity[]>();
    for(const tick of ticks) {
      const timeBucket = this.timeBucket(tick.tickTime);
      if (m.has(timeBucket)) {
        const activities = m.get(timeBucket) as Activity[];
        const index = activities.findIndex(t => t.text === tick.activity);
        if (index < 0) {
          activities.push({ text: tick.activity, freq: 1 });
        } else {
          activities[index]['freq'] += 1;
        }
        m.set(timeBucket, activities);
      } else {
        m.set(timeBucket, [{
          text: tick.activity,
          freq: 1
        }]);
      }
    }

    Promise.all([...m.entries()].map(item => this.create({
      timeBucket: item[0],
      activities: item[1]
    }, {
      ...params,
      type: 'upsert',
      provider: undefined
    })));

    if (m.has(bucket)) {
      const activities = m.get(bucket) as Activity[];
      return activities.sort(sortFn).map(mapFn);
    }
    return [];
  }

  timeBucket(ts: number): number {
    const t = new Date(ts);
    const minutes = t.getUTCHours() * 60 + t.getUTCMinutes();
    return minutes - minutes % this.roundTo;
  }
}