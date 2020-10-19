import chai from 'chai';
import sinon from 'sinon';
import faker from 'faker';
import app from '../../src/app';

const { expect, assert } = chai;

describe('\'suggest-activities\' service', () => {
  it('registered the service', () => {
    assert.isOk(app.service('suggest-activities'), 'Registered the service');
  });

  const params = { user: undefined };
  before(async () => {
    params.user = await app.service('users').create({
      email: faker.internet.email(),
      password: faker.internet.password()
    });
  });

  after(async () => {
    await app.service('users').remove(params.user._id);
  });

  describe('`create` method', () => {
    const svc = app.service('suggest-activities');
    afterEach((done) => {
      const db = svc.getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    it('should create an item with userId', async () => {
      const result = await svc.create({
        timeBucket: 0,
        activities: []
      }, params);
      expect(result.userId).to.be.eql(params.user._id);
    });

    it('should upsert from ticks', async () => {
      const result = await svc.create({
        activity: 'upsert',
        tickTime: Date.now()
      }, {
        ...params,
        type: 'upsert'
      });
      expect(result).to.be.eql(1);
    });

    it('should upsert from refresh', async () => {
      const result = await svc.create({
        timeBucket: 0,
        activities: ['a'],
      }, {
        ...params,
        type: 'upsert'
      });
      expect(result).to.be.eql(1);
    });
  });

});
