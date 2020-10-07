import app from '../../src/app';

describe('\'helpers\' service', () => {
  it('registered the service', () => {
    const service = app.service('helpers');
    expect(service).toBeTruthy();
  });
});
