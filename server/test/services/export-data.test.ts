import assert from 'assert';
import app from '../../src/app';

describe('\'export-data\' service', () => {
  it('registered the service', () => {
    const service = app.service('export-data');

    assert.ok(service, 'Registered the service');
  });
});
