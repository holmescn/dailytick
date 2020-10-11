import app from '../../src/app';

describe('\'activityTags\' service', () => {
  it('registered the service', () => {
    const service = app.service('activity-tags');
    expect(service).toBeTruthy();
  });
});
