// import { BadRequest } from '@feathersjs/errors';
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
});
