import app from '../../src/app';

describe('\'ticks\' service', () => {
  it('registered the service', () => {
    const service = app.service('ticks');
    expect(service).toBeTruthy();
  });
});
