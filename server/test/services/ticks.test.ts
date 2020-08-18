import { BadRequest } from '@feathersjs/errors';
import app from '../../src/app';

describe('\'ticks\' service', () => {
  const params = { user: undefined };

  beforeAll(async () => {
    params.user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });
  });

  afterAll(async () => {
    await app.service('users').remove(params.user._id);
  });

  it('registered the service', () => {
    const service = app.service('ticks');
    expect(service).toBeTruthy();
  });

  describe('creates a tick', () => {
    const local = { tick: undefined };
    beforeAll(async () => {
      local.tick = await app.service('ticks').create({
        tickTime: Date.now(),
        activity: '',
        tags: ['tag-1', 'tag-2']
      }, params);
    });

    afterAll(async () => {
      await app.service('ticks').remove(local.tick._id);
    });

    test('contains same tags', () => {
      expect(local.tick.tags).toEqual(['tag-1', 'tag-2']);
    });

    test('hide userId', () => {
      expect(local.tick).not.toHaveProperty('userId');
    });

    test('hide createdAt', () => {
      expect(local.tick).not.toHaveProperty('createdAt');
    });
  });

  describe('creates with malformed data', () => {
    test('missing tickTime', async () => {
      try {
        await app.service('ticks').create({
          activity: ''
        }, params);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequest);
        expect(e.errors.tickTime).toBe('required');
      }
    });
  
    test('tickTime with wrong type', async () => {
      try {
        await app.service('ticks').create({
          tickTime: 'xx',
          activity: ''
        }, params);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequest);
        expect(e.errors.tickTime).toBe('should be number');
      }
    });
  
    test('missing activity', async () => {
      try {
        await app.service('ticks').create({
          tickTime: Date.now()
        }, params);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequest);
        expect(e.errors.activity).toBe('required');
      }
    });

    test('missing tags', async () => {
      const tick = await app.service('ticks').create({
        tickTime: Date.now(),
        activity: ''
      }, params);

      expect(tick.tags).toEqual([]);
    });
  });
});
