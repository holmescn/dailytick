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
    const tick = {
      ...data,
      userId: params.user._id,
    };

    // Add empty tags if no given.
    tick.tags = tick.tags || [];

    Promise.all([
      this.freqActivity(tick, params),
      ...tick.tags.map((tag: string) => this.freqTag(tag, params))
    ]);

    // Call the original `create` method with existing `params` and new data
    return super.create(tick, params);
  }

  async freqActivity(tick: any, params: Params): Promise<void> {
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
        await this.app.service('activities')._patch(exists['data'][0]['_id'], {
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

    const counts = await this.find({
      ...params,
      query: {
        activity: tick.activity,
        tags: tick.tags,
        userId: params.user._id,
        $limit: 1
      }
    });

    if (counts['total'] >= 5) {
      try {
        const result = await this.app.service('activities').create({
          activity,
          userId: params.user._id,
          freq: counts['total'],
        }, params);
        console.debug(result);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async freqTag(tag: string, params: Params): Promise<void> {
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
        await this.app.service('tags')._patch(exists['data'][0]['_id'], {
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
        userId: params.user._id,
        freq: 1,
      }, params);
      console.debug(result);
    } catch (e) {
      console.log(e);
    }
  }
}
