import { discard, validate } from 'feathers-hooks-common';
import * as authentication from '@feathersjs/authentication';
import { Hook } from '@feathersjs/feathers';
import { createValidator } from './validator';
import setTimestamp from '../../hooks/set-timestamp';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
      // (
      // (validate(createValidator) as unknown) as Hook,
      validate(createValidator) as Hook,
      setTimestamp('createdAt')
    ],
    update: [setTimestamp('updateddAt')],
    patch: [setTimestamp('updateddAt')],
    remove: []
  },

  after: {
    all: [
      discard('userId', 'createdAt', 'updatedAt') as Hook
    ],
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
