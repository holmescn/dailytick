import { HookContext } from '@feathersjs/feathers';

interface TickData {
  tickTime: number;
  activity: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createValidator = (data: TickData, context: HookContext): any | null => {
  if ('tickTime' in data) {
    if (typeof data.tickTime !== 'number') {
      return { tickTime: 'should be number' };
    }
  } else {
    return { tickTime: 'required' };
  }

  if ('activity' in data) {
    if (typeof data.activity !== 'string') {
      return { activity: 'should be string' };
    }
  } else {
    return { activity: 'required' };
  }

  return null;
};
