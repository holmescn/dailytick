import app from '../../src/app';

describe('\'popular-activities\' service', () => {
  it('registered the service', () => {
    const service = app.service('popular-activities');
    expect(service).toBeTruthy();
  });
});
