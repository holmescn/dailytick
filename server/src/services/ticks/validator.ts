import { HookContext } from '@feathersjs/feathers';

interface CreateData {
  tickTime?: any;
  activity?: any;
  tags?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createValidator = (data: CreateData, context: HookContext): any | null => {
  const errors: {
    tickTime?: string,
    activity?: string,
    tags?: string,
  } = {};

  if (data.tickTime) {
    if (typeof data.tickTime !== 'number') {
      errors.tickTime = 'should be number';
    }
  } else {
    errors.tickTime = 'required';
  }

  if (data.activity) {
    if (typeof data.activity !== 'string') {
      errors.activity = 'should be a string';
    }
  } else {
    errors.activity = 'required';
  }

  if (data.tags) {
    if (!(data.tags instanceof Array)) {
      errors.tags = 'should be an array of string';
    }
  }

  if (errors.tickTime || data.activity || errors.tags) {
    return errors;
  }
  return null;
};
