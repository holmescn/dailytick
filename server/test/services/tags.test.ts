import chai from 'chai';
import sinon from 'sinon';
import faker from 'faker';
import app from '../../src/app';
import TicksService from '../../src/services/ticks/ticks.service';

const { expect, assert } = chai;

describe('\'tags\' service', () => {
  it('registered the service', () => {
    assert.isOk(app.service('tags'), 'Registered the service');
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
      const db = app.service('tags').getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    it('should add a new tag with userId', async () => {
      const tag = await app.service('tags').create({
        tag: 'test',
        freq: 1
      }, params);
      assert.isOk(tag.userId, 'userId added');
    });

    it('should upsert tag\'s freq', async () => {
      const tag = 'upsert-tag-test';
      const created = await app.service('tags').create({
        tag,
        freq: 10
      }, params);

      await app.service('tags').create({
        tag
      }, {
        ...params,
        type: 'upsert'
      });

      const updated = await app.service('tags').get(created._id, params);
      expect(updated.freq).to.be.eql(created.freq+1);
    });
  });

  describe('`find` method', () => {
    const query = {
      $sort: { freq: -1 },
      $limit: 10,
      $select: ['tag']  
    };

    afterEach((done) => {  
      const db = app.service('tags').getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true }, () => done());
    });

    it('should refresh from `ticks` service', async () => {
      const ticksService = app.service('ticks');
      const stub = sinon.stub(ticksService, 'find').returns([{
        tags: ['tag-1', 'tag-2']
      }, {
        tags: ['tag-1', 'tag-3']
      }]);

      const service = app.service('tags');

      const tags = await service.find({
        ...params,
        query
      });

      expect(stub.calledOnce).to.be.true;
      expect(tags.total).to.be.eql(3);
    });
    
    it('should returns most freqs tags', async () => {
      await Promise.all([...Array(20).keys()].map(i => app.service('tags').create({
        tag: `tag-${i+1}`,
        freq: i+1
      }, params)));

      const tags = await app.service('tags').find({
        ...params,
        query
      });

      expect(tags.data.length).to.be.eql(10);
      expect(tags.data[0].tag).to.be.eql('tag-20');
    });
  });
});
