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

    const tags = tickData.tags.join(' #');
    const text = `${tickData.activity} #${tags}`;

    this.app.service('activities').create({
      text
    }, params);

    tickData.tags.forEach((text: string) => {
      this.app.service('tags').create({
        text
      }, params);
    });

    // Call the original `create` method with existing `params` and new data
    return super.create(tickData, params);
  }
}
