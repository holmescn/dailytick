import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Tags extends Service {
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
    let tickTime = 0, total = 0;
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
      tick.tags.forEach((t: string) => {
        const tag = t.trim();
        if (tag) m.set(tag, (m.get(tag) || 0) + 1);
      });
    });

    // tags 全都收录
    await Promise.all([...m.entries()].map(entry => this.create({
      tag: entry[0],
      freq: entry[1]
    }, {
      ...params,
      provider: undefined
    })));
  }
}
