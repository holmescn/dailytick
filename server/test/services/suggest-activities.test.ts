import chai from 'chai';
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

    it('should create new item with userId', async () => {
      const result = await svc.create({
        tickTime: 0,
        activity: 'test-create',
      }, params);
      expect(result.userId).to.be.eql(params.user._id);
      expect(result.freq).to.be.eql(1);
    });

    it('should update item\'s freq', async () => {
      const r0 = await svc.create({
        tickTime: 0,
        activity: 'test-create',
      }, params);
  
      const r1 = await svc.create({
        tickTime: 0,
        activity: 'test-create',
      }, params);
  
      expect(r0.userId).to.be.eql(params.user._id);
      expect(r1.freq).to.be.eql(2);
    });

  });

  describe('`update` method', () => {
    const svc = app.service('suggest-activities');
    afterEach((done) => {
      const db = svc.getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    it('should return null if not exists', async () => {
      const result = await svc.update('u', {
        tickTime: 0,
        activity: 'test-not-exists',
      }, params);
  
      expect(result).to.be.null;
    });

    it('should update item\'s freq', async () => {
      const r0 = await svc.create({
        tickTime: 0,
        activity: 'test-create',
      }, params);
  
      const r1 = await svc.update('u', {
        tickTime: 0,
        activity: 'test-create',
      }, params);
  
      expect(r0.userId).to.be.eql(params.user._id);
      expect(r1.freq).to.be.eql(2);
    });

  });

});
