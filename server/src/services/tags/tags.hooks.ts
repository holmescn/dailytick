import * as authentication from '@feathersjs/authentication';
import { disallow, discard } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [ ],
    get: [ disallow('external') ],
    create: [ disallow('external') ],
    update: [ disallow('external') ],
    patch: [ disallow('external') ],
    remove: [ disallow('external') ]
  },

  after: {
    all: [],
    find: [ discard('_id') ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
