import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export class Ticks extends Service {
  app: Application;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find (params: Params): Promise<any> {
    if (typeof params?.query?.tickTime === 'string') {
      switch(params.query.tickTime) {
      case 'today': return await this.todayTicks(params, params.query.now);
      case 'yesterday': return await this.yesterdayTicks(params, params.query.now);
      case 'this-week': return await this.thisWeekTicks(params, params.query.now);
      case 'last-week': return await this.lastWeekTicks(params, params.query.now);
      case 'this-month': return await this.thisMonthTicks(params, params.query.now);
      case 'last-month': return await this.lastMonthTicks(params, params.query.now);
      case 'custom': return await this.customTimeTicks(params);
      default: return [];
      }
    }
  
    return await super.find({
      ...params,
      query: {
        ...params.query,
        userId: params.user._id
      }
    });
  }

  async findBetween(startTime: number, endTime: number, params: Params): Promise<any[]> {
    const columns = ['activity', 'tickTime', 'tags'];
    const ticks = await this._find({
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

    const tickBeforeStartTime = await this._find({
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
  
    const tickAfterEndTime = await this._find({
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

  async todayTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M, D);
    const endTime = new Date(Y, M, D+1);
  
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async yesterdayTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M, D-1);
    const endTime = new Date(Y, M, D);
  
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async thisWeekTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M, D);
    if (startTime.getDay() > 1) {
      startTime.setDate(startTime.getDate() - startTime.getDay() + 1);
    }
    const endTime = new Date(Y, M, D);
    if (endTime.getDay() > 0) {
      endTime.setDate(endTime.getDate() + (7 - endTime.getDay()) + 1);
    }
  
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async lastWeekTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M, D);
    if (startTime.getDay() > 1) {
      startTime.setDate(startTime.getDate() - startTime.getDay() + 1 - 7);
    }
    const endTime = new Date(Y, M, D);
    if (endTime.getDay() > 0) {
      endTime.setDate(endTime.getDate() - endTime.getDay() + 1);
    }
  
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async thisMonthTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M, 1);
    const endTime = new Date(Y, M+1, 1);
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async lastMonthTicks(params: Params, now: number): Promise<any> {
    const t0 = new Date(now);
    const Y = t0.getFullYear();
    const M = t0.getMonth();
    const D = t0.getDate();
    const startTime = new Date(Y, M-1, 1);
    const endTime = new Date(Y, M, 1);
    return this.findBetween(startTime.getTime(), endTime.getTime(), params);
  }

  async customTimeTicks(params: Params): Promise<any> {
    const startTime = params.query?.startTime as number;
    const endTime = params.query?.endTime as number;
    return this.findBetween(startTime, endTime, params);
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
      ...tickData.tags.map((tag: string) => this.updateTagFreq(tag, params))
    ]);

    // Call the original `create` method with existing `params` and new data
    return super.create(tickData, params);
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
          provider: undefined,
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
      }, {
        ...params,
        provider: undefined
      });
    } catch (e) {
      console.error(e);
    }
  }
}
