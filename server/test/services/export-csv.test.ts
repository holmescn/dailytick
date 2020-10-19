import assert from 'assert';
import app from '../../src/app';

describe('\'export-csv\' service', () => {
  it('registered the service', () => {
    const service = app.service('export-csv');

    assert.ok(service, 'Registered the service');
  });
});
