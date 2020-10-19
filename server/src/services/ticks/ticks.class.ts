import { Id, Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Ticks extends Service {
  app: Application;
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find (params: Params): Promise<any> {
    return await super.find({
      ...params,
      query: {
        ...params.query,
        userId: params.user._id
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create (data: any, params: Params): Promise<any> {
    const tickData = {
      ...data,
      userId: params.user._id,
      tags: data.tags || []
    };

    Promise.all([
      this.app.service('suggest-activities').create({
        activity: tickData.activity,
        tickTime: tickData.tickTime
      }, {
        ...params,
        type: 'upsert',
        provider: undefined
      }),
      this.app.service('activity-tags').create({
        activity: tickData.activity,
        tags: tickData.tags
      }, {
        ...params,
        type: 'upsert',
        provider: undefined,
      }),
      ...tickData.tags.map((tag: string) => this.app.service('tags').create({
        tag
      }, {
        ...params,
        type: 'upsert',
        provider: undefined
      }))
    ]);

    // Call the original `create` method with existing `params` and new data
    return super.create(tickData, params);
  }

  async get(id: Id, params: Params): Promise<any> {
    if (id === 'time-range') {
      return await this.findTicksInTimeRange(params);
    }

    return await super.get(id, params);
  }

  async findTicksInTimeRange(params: Params): Promise<any> {
    const startTime = params.query?.startTime as number;
    const endTime = params.query?.endTime as number;
    const columns = ['activity', 'tickTime', 'tags'];
    const ticks = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: {
          $gte: startTime,
          $lte: endTime
        },
        $sort: { tickTime: 1 },
        $select: columns,
      }
    });

    const tickBeforeStartTime = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $lt: startTime },
        $sort: { tickTime: -1 },
        $limit: 1,
        $select: columns,
      }
    });

    const tickAfterEndTime = await this.find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: endTime },
        $sort: { tickTime: 1 },
        $limit: 1,
        $select: columns,
      }
    });

    return [...tickBeforeStartTime, ...ticks, ...tickAfterEndTime];
  }
}
