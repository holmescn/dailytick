// Initializes the `suggestTags` service on path `/suggest-tags`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SuggestTags } from './suggest-tags.class';
import createModel from '../../models/suggest-tags.model';
import hooks from './suggest-tags.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'suggest-tags': SuggestTags & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/suggest-tags', new SuggestTags(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('suggest-tags');

  service.hooks(hooks);
}
