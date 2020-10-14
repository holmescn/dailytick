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
    const results = await super.find(Object.assign(params, {
      query: Object.assign(params.query, {
        userId: params.user._id
      })
    }));

    if (results.total > 0) {
      return results;
    }

    return await this.refresh(params);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create(data: any, params: Params): Promise<any> {
    if (data.tag) {
      const tag = data.tag;
      const db = this.getModel(params);
      const update = data.freq ? {
        $set: {
          tag,
          userId: params.user._id,
          freq: data.freq
        }
      } : {
        $set: {
          tag,
          userId: params.user._id,
        },
        $inc: { freq: 1 }
      };
      return new Promise((resolve, reject) => {
        db.update({
          tag
        }, update, {
          upsert: true
        }, (err: Error|null, numberOfUpdated: number) => {
          if (err) reject(err);
          resolve(numberOfUpdated);
        });
      });
    } else {
      return super.create({
        ...data,
        userId: params.user._id
      }, params);
    }
  }

  async refresh(params: Params): Promise<any> {
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

    const tags = [...m.entries()]
      .filter(entry => entry[1] > 1)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, params.query?.$limit || 10);
    return {
      total: m.size,
      limit: params.query?.$limit || 10,
      skip: 0,
      data: tags.map(tag => { tag })
    };
  }
}
