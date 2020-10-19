import * as authentication from '@feathersjs/authentication';
import { setNow } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [ ],
    get:  [ ],
    create: [ setNow('createdAt') ],
    update: [ setNow('updatedAt') ],
    patch:  [ setNow('updatedAt') ],
    remove: []
  },

  after: {
    all: [],
    find: [],
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
