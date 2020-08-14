import { BadRequest } from '@feathersjs/errors';
import app from '../../src/app';

describe('\'ticks\' service', () => {
  it('registered the service', () => {
    const service = app.service('ticks');
    expect(service).toBeTruthy();
  });

  describe('creates a tick', () => {
    const local = { tick: undefined };
    const params = { user: undefined };
    beforeAll(async () => {
      params.user = await app.service('users').create({
        email: 'test@example.com',
        password: 'secret'
      });
    });

    beforeEach(async () => {
      local.tick = await app.service('ticks').create({
        tickTime: Date.now(),
        activity: ''
      }, params);
    });

    test('with empty tags', () => {
      const { tick } = local;
      expect(tick).toHaveProperty('tags');
      expect(tick['tags']).toEqual([]);  
    });

    test('hide some properties', () => {
      const { tick } = local;
      expect(tick).toHaveProperty('_id');
      expect(tick).not.toHaveProperty('userId');
      expect(tick).not.toHaveProperty('createdAt');
    });
  });

  describe('creates malformed tick', () => {
    const params = { user: undefined };
    beforeAll(async () => {
      params.user = await app.service('users').create({
        email: 'test1@example.com',
        password: 'secret'
      });
    });

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
  });
});
