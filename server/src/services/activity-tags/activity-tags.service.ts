// Initializes the `activity-tags` service on path `/activity-tags`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ActivityTags } from './activity-tags.class';
import createModel from '../../models/activity-tags.model';
import hooks from './activity-tags.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'activity-tags': ActivityTags & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/activity-tags', new ActivityTags(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('activity-tags');

  service.hooks(hooks);
}
