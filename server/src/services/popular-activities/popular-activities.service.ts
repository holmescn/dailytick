// Initializes the `popular-activities` service on path `/popular-activities`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PopularActivities } from './popular-activities.class';
import hooks from './popular-activities.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'popular-activities': PopularActivities & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/popular-activities', new PopularActivities(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('popular-activities');

  service.hooks(hooks);
}
