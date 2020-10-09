import app from '../../src/app';

describe('\'suggestTags\' service', () => {
  it('registered the service', () => {
    const service = app.service('suggest-tags');
    expect(service).toBeTruthy();
  });
});
