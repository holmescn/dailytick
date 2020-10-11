import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Activities extends Service {
  app: Application;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find(params: Params): Promise<any> {
    const db = this.getModel(params);
    const n = await new Promise(resolve => {
      db.count({
        userId: params.user._id
      }, (err: Error|null, n: number) => {
        if (err) {
          console.error(err);
          resolve(-1);
        } else {
          resolve(n);
        }
      })
    });

    if (n === 0) {
      await this.refresh(params);
    }

    return super.find(Object.assign(params, {
      query: Object.assign(params.query, {
        userId: params.user._id
      })
    }));
  }

  create(data: any, params: Params): Promise<any> {
    return super.create({
      ...data,
      userId: params.user._id
    }, params);
  }

  async refresh(params: Params): Promise<void> {
    const m = new Map<string, number>();
    const ticks = await this.app.service('ticks').find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        $sort: { tickTime: 1 },
      }
    });

    ticks.forEach((tick: any) => {
      const tags = tick.tags.join(' #');
      const activity: string = `${tick.activity} #${tags}`;
      m.set(activity, (m.get(activity) || 0) + 1);
    });

    // 选取 top 50
    const entries = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, Math.min(m.size, 50));
    await Promise.all(entries.map(entry => this.create({
      activity: entry[0],
      freq: entry[1]
    }, {
      ...params,
      provider: undefined
    })));
  }
}
