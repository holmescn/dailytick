import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

// A type interface for a tick (it does not validate any data)
interface TickData {
  _id: string;
  tickTime: number;
  activity: string;
  tags: string[];
}

export class Ticks extends Service<TickData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }

  create (data: Partial<TickData>, params: Params): Promise<TickData | TickData[]> {
    const tickData = {
      ...data,
      userId: params.user._id,
    };

    // Add empty tags if no given.
    tickData.tags = tickData.tags || [];

    // Call the original `create` method with existing `params` and new data
    return super.create(tickData, params);
  }
}
