// Initializes the `helpers` service on path `/helpers`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Helpers } from './helpers.class';
import hooks from './helpers.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'helpers': Helpers & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/helpers', new Helpers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('helpers');

  service.hooks(hooks);
}
