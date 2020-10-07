import NeDB from 'nedb';
import path from 'path';
import { Application } from '../declarations';

export default function (app: Application): NeDB<any>  {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, 'activities.db'),
    inMemoryOnly: false,
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'activity', unique: true, sparse: true });

  return Model;
}
