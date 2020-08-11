import app from '../../src/app';

describe('\'popular-tags\' service', () => {
  it('registered the service', () => {
    const service = app.service('popular-tags');
    expect(service).toBeTruthy();
  });
});
