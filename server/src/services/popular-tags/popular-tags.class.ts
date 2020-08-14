import { Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';

interface ServiceOptions {}

export class PopularTags implements Partial<ServiceMethods<any>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<any[] | Paginated<any>> {
    return [];
  }
}
