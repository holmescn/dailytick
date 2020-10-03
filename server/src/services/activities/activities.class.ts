import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Activities extends Service {
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
  async create ({ text }: any, params: Params): Promise<any> {
    const { data: activities } = await this.find({
      ...params,
      query: {
        text,
        $limit: 1
      }
    });

    if (activities.length === 1) {
      return this.patch(activities[0]._id, {
        freq: activities[0].freq + 1,
      }, params);
    } else {
      return super.create({
        text,
        freq: 1,
        userId: params.user._id,
      }, params);
    }
  }
}
