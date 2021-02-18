// Initializes the `export-csv` service on path `/export-csv`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ExportData } from './export-data.class';
import hooks from './export-data.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'export-data': ExportData & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/export-data', new ExportData(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('export-data');

  service.hooks(hooks);
}
