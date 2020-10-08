import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';


export class Ticks extends Service {
  app: Application;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  find(params: Params): Promise<any> {
    return super.find(Object.assign(params, {
      query: Object.assign(params.query, {
        userId: params.user._id
      })
    }));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create (data: any, params: Params): Promise<any> {
    const tickData = {
      ...data,
      userId: params.user._id,
    };

    // Add empty tags if no given.
    tickData.tags = tickData.tags || [];

    Promise.all([
      this.updateActivityFreq(tickData, params),
      ...tickData.tags.map((tag: string) => this.updateTagFreq(tag, params))
    ]);

    // Call the original `create` method with existing `params` and new data
    return super.create(tickData, params);
  }

  async updateActivityFreq(tick: any, params: Params): Promise<void> {
    const tags = tick.tags.join(' #');
    const activity = `${tick.activity} #${tags}`;

    const exists = await this.app.service('activities').find({
      ...params,
      query: {
        activity,
        $limit: 1
      },
    });

    // 已经保存过
    if (exists && exists.total > 0) {
      try {
        const id = exists['data'][0]['_id'];
        await this.app.service('activities').patch(id, {
          $inc: { freq: 1 }
        }, {
          ...params,
          nedb: { upsert: true }
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  async updateTagFreq(tag: string, params: Params): Promise<void> {
    const exists = await this.app.service('tags').find({
      ...params,
      query: {
        tag,
        $limit: 1
      },
    });

    // 已经保存过
    if (exists && exists.total > 0) {
      try {
        const id = exists['data'][0]['_id'];
        await this.app.service('tags').patch(id, {
          $inc: { freq: 1 }
        }, {
          ...params,
          nedb: { upsert: true }
        });
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const result = await this.app.service('tags').create({
        tag,
        freq: 1,
      }, params);
    } catch (e) {
      console.error(e);
    }
  }
}
