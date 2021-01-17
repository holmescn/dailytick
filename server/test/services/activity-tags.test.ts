import chai from 'chai';
import sinon from 'sinon';
import faker from 'faker';
import app from '../../src/app';
import TicksService from '../../src/services/ticks/ticks.service';

const { expect, assert } = chai;

describe('\'activity-tags\' service', () => {
  it('registered the service', () => {
    assert.isOk(app.service('activity-tags'), 'Registered the service');
  });

  const params = { user: undefined };
  before(async () => {
    params.user = await app.service('users').create({
      email: faker.internet.email(),
      password: faker.internet.password()
    });
  });

  after(async () => {
    app.configure(TicksService);
    await app.service('users').remove(params.user._id);
  });

  describe('`create` method', () => {
    afterEach((done) => {
      const db = app.service('activity-tags').getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    it('should create a record with userId', async () => {
      const result = await app.service('activity-tags').create({
        activity: faker.lorem.words(3),
        tags: faker.lorem.words(3).split(' ')
      }, params);

      expect(result.userId).to.be.eql(params.user._id);
    });

    it('should upsert tags', async () => {
      const svc = app.service('activity-tags');
      const created = await svc.create({
        activity: faker.lorem.words(3),
        tags: faker.lorem.words(3).split(' ')
      }, params);

      await svc.create({
        activity: created.activity,
        tags: ['tag-1', 'tag-2']
      }, {
        ...params,
        type: 'upsert'
      });

      const updated = await svc.get(created._id, params);
      console.log(updated);

      expect(updated.tags.length).to.be.eql(5);
    });
  });

  describe('`find` method', () => {
    const query = {
      activity: faker.lorem.words(3)
    };

    afterEach((done) => {  
      const db = app.service('activity-tags').getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    // it('should refresh from `ticks` service', async () => {
    //   const ticksService = app.service('ticks');
    //   const stub = sinon.stub(ticksService, 'find').returns([{
    //     activity: query.activity,
    //     tags: ['tag-1', 'tag-2']
    //   }, {
    //     activity: `${query.activity} 1`,
    //     tags: ['tag-1', 'tag-3']
    //   }]);

    //   const svc = app.service('activity-tags');

    //   const tags = await svc.find({
    //     ...params,
    //     query
    //   });

    //   expect(stub.calledOnce).to.be.true;
    //   expect(tags.length).to.be.eql(2);
    // });
  });
});
