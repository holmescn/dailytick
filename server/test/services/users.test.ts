import app from '../../src/app';

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');
    expect(service).toBeTruthy();
  });

  it('creates a user, encrypts password', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });

    // Makes sure the password got encrypted
    expect(user.password).not.toBe('secret');
  });

  it('removes password for external requests', async () => {
    // Setting `provider` indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: 'test2@example.com',
      password: 'secret'
    }, params);

    // Make sure password has been removed
    expect(user.password).toBeUndefined();
  });
});
