import { Params } from '@feathersjs/feathers';
import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';


export class Ticks extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create (data: any, params: Params): Promise<any> {
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
