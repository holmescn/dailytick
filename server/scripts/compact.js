var Datastore = require('nedb')
  , db = new Datastore({ filename: process.argv[2], autoload: true });

db.on('compaction.done', function () {
  console.log(`compaction.done`);
});

db.persistence.compactDatafile();
