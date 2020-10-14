import NeDB from 'nedb';
import path from 'path';
import { Application } from '../declarations';

export default function (app: Application): NeDB<any>  {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    // filename: path.join(dbPath, 'tags.db'),
    inMemoryOnly: true,
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'tag', unique: true, sparse: true });

  return Model;
}
