// Initializes the `suggestActivities` service on path `/suggest-activities`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SuggestActivities } from './suggest-activities.class';
import createModel from '../../models/suggest-activities.model';
import hooks from './suggest-activities.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'suggest-activities': SuggestActivities & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/suggest-activities', new SuggestActivities(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('suggest-activities');

  service.hooks(hooks);
}
