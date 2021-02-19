import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

interface Tick {
  activity: string,
  tags: string[]
}

export class ActivityTags extends Service {
  app: Application;
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  create(data: Partial<any>, params: Params): Promise<any> {
    console.log(data);
    if (params.type === 'upsert') {
      const db = this.getModel(params);
      return new Promise((resolve, reject) => {
        db.update({
          activity: data.activity,
          userId: params.user._id
        }, {
          $set: {
            activity: data.activity,
            userId: params.user._id,
            tags: data.tags
          }
        }, {
          upsert: true
        }, (err: Error|null, numberOfUpdated: number) => {
          if (err) reject(err);
          resolve(numberOfUpdated);
        });
      });
    }
    return super.create(Object.assign(data, {
      userId: params.user._id
    }), params);
  }

  async find (params: Params): Promise<any> {
    const results = await super.find({
      ...params,
      paginate: false,
      query: {
        ...params?.query,
        userId: params?.user._id
      }
    });

    console.log(results);

    if (results.length > 0) {
      const tags: string[] = [];
      for (const item of results) {
        if (item.tags) {
          tags.push(...item.tags);
        }
      }

      return {
        total: tags.length,
        limit: tags.length,
        skip: 0,
        data: tags 
      };
    }

    const tags = await this.refresh(params);
    return {
      total: tags.length,
      limit: tags.length,
      skip: 0,
      data: tags 
    };
  }

  async refresh(params: Params): Promise<any> {
    const t0 = new Date();
    t0.setHours(0); t0.setMinutes(0); t0.setSeconds(0); t0.setMilliseconds(0);
    t0.setDate(1); t0.setMonth(t0.getMonth() - 2);

    const ticks: Tick[] = await this.app.service('ticks').find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: t0.getTime() },
        $sort: { tickTime: -1 },
        $select: ['activity', 'tags']
      }
    });

    const m = new Map<string, any>();
    for(const tick of ticks) {
      const activity = tick.activity;
      if (!m.has(activity)) {
        m.set(activity, {
          activity,
          tags: tick.tags
        });
      }
    }

    Promise.all([...m.values()].map(item => this.create(item, {
      ...params,
      type: 'upsert',
      provider: undefined
    })));

    const activity = params.query?.activity;
    if (m.has(activity)) {
      const entry = m.get(activity);
      return [...entry.tags];
    }
  
    return [];
  }
}
