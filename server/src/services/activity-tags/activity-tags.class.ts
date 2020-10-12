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

  async find (params: Params): Promise<any> {
    const results = await super.find({
      ...params,
      paginate: false,
      query: Object.assign(params?.query, {
        userId: params?.user._id
      })
    });

    if (results.length === 0) {
      return await this.refresh(params);
    }

    return results;
  }

  create(data: Partial<any>, params: Params): Promise<any> {
    return super.create(Object.assign(data, {
      userId: params.user._id
    }), params);
  }

  async refresh(params: Params): Promise<any> {
    const ticks: Tick[] = await this.app.service('ticks')._find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: 0 },
        $sort: { tickTime: 1 },
        $select: ['activity', 'tags']
      }
    });

    const m = new Map<string, any>();
    for(const tick of ticks) {
      const activity = tick.activity;
      if (!m.has(activity)) {
        m.set(activity, {
          activity,
          tags: new Set<string>(),
          freq: 0,
        });
      }
      const entry: {tags: Set<string>, freq: number} = m.get(activity);
      entry.freq += 1;
      tick.tags.forEach(tag => entry.tags.add(tag));
      m.set(activity, entry);
    }

    for (const entry of m.values()) {
      const tags = [...entry.tags];

      try {
        await this._create({
          activity: entry.activity,
          tags
        }, {
          ...params,
          provider: undefined
        });
      } catch (e) {
        if (e.errorType === 'uniqueViolated') {
          continue;
        }
        console.error('create failed:', e);
      }
    }

    const activity = params.query?.activity;
    if (m.has(activity)) {
      const entry = m.get(activity);
      return [...entry.tags];
    }
  
    return [];
  }
}
