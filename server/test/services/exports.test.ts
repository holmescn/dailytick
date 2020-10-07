import app from '../../src/app';

describe('\'exports\' service', () => {
  it('registered the service', () => {
    const service = app.service('exports');
    expect(service).toBeTruthy();
  });
});
