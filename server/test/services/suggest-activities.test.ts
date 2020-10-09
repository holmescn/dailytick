import app from '../../src/app';

describe('\'suggestActivities\' service', () => {
  it('registered the service', () => {
    const service = app.service('suggest-activities');
    expect(service).toBeTruthy();
  });
});
