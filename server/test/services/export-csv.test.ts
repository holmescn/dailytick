import app from '../../src/app';

describe('\'exportCsv\' service', () => {
  it('registered the service', () => {
    const service = app.service('export-csv');
    expect(service).toBeTruthy();
  });
});
