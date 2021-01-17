import { Id, Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface Item {
  time: number,
  activity: string,
  freq: number
}

interface UpdateType {
  $set: {
    time: number,
    userId: string,
    activity: string,
    freq: number
  }
}

export class SuggestActivities extends Service {
  app: Application;
  roundTo = 30;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  create(data: Partial<any>, params: Params): Promise<any> {
    const db = this.getModel(params);
    const bucket = this.timeBucket(data.tickTime);
    return new Promise((resolve, reject) => {
      const query = {
        time: bucket,
        activity: data.activity,
        userId: params.user._id
      };
  
      db.findOne(query, (err, doc) => {
        if (err) reject(err);

        if (doc) {
          db.update(query, {
            $inc: {
              freq: 1
            }
          }, { upsert: true }, (err) => {
            if (err) reject(err);
            resolve({
              ...doc,
              freq: doc.freq + 1,
            });
          });
        } else {
          db.insert({
            ...query,
            freq: 1,
          }, function (err, newDoc) {
            if (err) reject(err);
            resolve(newDoc);
          });
        }
      });
    });
  }

  update(id: Id, data: Partial<any>, params?: Params): Promise<any> {
    const db = this.getModel(params || {});
    const bucket = this.timeBucket(data.tickTime);
    return new Promise((resolve, reject) => {
      const query = {
        time: bucket,
        activity: data.activity,
        userId: params?.user._id
      };
  
      db.findOne(query, (err, doc) => {
        if (err) reject(err);

        if (doc) {
          db.update(query, {
            $inc: {
              freq: 1
            }
          }, { upsert: true }, (err) => {
            if (err) reject(err);
            resolve({
              ...doc,
              freq: doc.freq + 1,
            });
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async find (params: Params): Promise<any> {
    if (params.query?.now) {
      const activities = await this.activitiesInBucket(params, params.query.now);
      return {
        total: activities.length,
        limit: activities.length,
        skip: 0,
        data: activities
      };
    }

    return await super.find(Object.assign(params, {
      query: Object.assign(params?.query, {
        userId: params.user._id
      })
    }));
  }

  async activitiesInBucket(params: Params, now: number): Promise<string[]> {
    const bucket = this.timeBucket(now);
    const result: string[] = [];

    const query: any = {
      time: bucket,
      userId: params.user._id,
      $sort: {
        freq: -1
      }
    };

    const r0: Item[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (r0.length > 0) {
      const activities = r0.map(item => item.activity);
      for (const a of activities) {
        if (result.indexOf(a) < 0) {
          result.push(a);
        }
      }
    }
  
    query.time = { $lt: bucket };
    const r1: Item[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (r1.length > 0) {
      const activities = r1.map(item => item.activity);
      for (const a of activities) {
        if (result.indexOf(a) < 0) {
          result.push(a);
        }
      }
    }

    query.time = { $gt: bucket };
    const r2: Item[] = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query
    });

    if (r2.length > 0) {
      const activities = r2.map(item => item.activity);
      for (const a of activities) {
        if (result.indexOf(a) < 0) {
          result.push(a);
        }
      }
    }

    return result;
  }

  timeBucket(ts: number): number {
    const t = new Date(ts);
    const minutes = t.getUTCHours() * 60 + t.getUTCMinutes();
    return minutes - minutes % this.roundTo;
  }
}