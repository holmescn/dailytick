// Initializes the `popular-tags` service on path `/popular-tags`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PopularTags } from './popular-tags.class';
import hooks from './popular-tags.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'popular-tags': PopularTags & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/popular-tags', new PopularTags(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('popular-tags');

  service.hooks(hooks);
}
