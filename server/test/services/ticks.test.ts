import chai from 'chai';
import sinon from 'sinon';
import faker from 'faker';
import app from '../../src/app';
import ActivityTagsService from '../../src/services/activity-tags/activity-tags.service';
import TagsService from '../../src/services/tags/tags.service';
const { expect, assert } = chai;

describe('\'ticks\' service', () => {
  it('registered the service', () => {
    assert.isOk(app.service('ticks'), 'Registered the service');
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
    app.configure(TagsService);
    app.configure(ActivityTagsService);
  });

  describe('\'create\' method', () => {
    it('should call activity-tags and tags create function.', async () => {
      const tagsService = app.service('tags');
      const activityTagsService = app.service('activity-tags');
      const stub1 = sinon.stub(activityTagsService, 'create').returns(Promise.resolve());
      const stub2 = sinon.stub(tagsService, 'create').returns(Promise.resolve());
      await app.service('ticks').create({
        tickTime: faker.date.past().getTime(),
        activity: 'create-activity-1',
        tags: ['create-1', 'create-2']
      }, params);
      expect(stub1.calledOnce).to.be.true;
      expect(stub2.calledTwice).to.be.true;
    });
  });

  describe('`get` method', () => {
    afterEach(() => {
      const db = app.service('ticks').getModel(params);
      db.remove({
        userId: params.user._id
      }, { multi: true });
    });

    const today = new Date();
    it('should return ticks in time range', async () => {
      const t1 = new Date(today.getTime());
      const t2 = new Date(today.getTime());
      t1.setHours(0); t1.setMinutes(0); t1.setSeconds(0); t1.setMilliseconds(0);
      t2.setHours(0); t2.setMinutes(0); t2.setSeconds(0); t2.setMilliseconds(0);

      // today
      await Promise.all([...Array(5).keys()].map(i => app.service('ticks').create({
        activity: faker.lorem.words(i < 10 ? 3 : 3),
        tags: faker.lorem.words(3).split(' '),
        tickTime: Date.parse(faker.date.between(t1, t2))
      }, params)));
  
      // past
      await Promise.all([...Array(3).keys()].map(i => app.service('ticks').create({
        activity: faker.lorem.words(i < 10 ? 3 : 3),
        tags: faker.lorem.words(3).split(' '),
        tickTime: Date.parse(faker.date.past())
      }, params)));

      const ticks = await app.service('ticks').get('time-range', {
        ...params,
        query: {
          startTime: t1.getTime(),
          endTime: t2.getTime()
        }
      });

      expect(ticks).to.be.a('array');
      expect(ticks.length).to.be.eql(6);
    });
  });

  describe('getTimeRange', () => {
    function getTimeRange(type: string, now: number): any {
      const t1 = new Date(now);
      const t2 = new Date(now);
      const weekDay = t1.getDay() || 7;
      t1.setHours(0); t1.setMinutes(0); t1.setSeconds(0); t1.setMilliseconds(0);
      t2.setHours(0); t2.setMinutes(0); t2.setSeconds(0); t2.setMilliseconds(0);

      switch (type) {
      case 'today':
        t2.setDate(t2.getDate()+1);
        break;
      case 'yesterday':
        t1.setDate(t1.getDate()-1);
        break;
      case 'this-week':
        t1.setDate(t1.getDate() - (weekDay - 1));
        t2.setDate(t2.getDate() + (7 - weekDay + 1));
        break;
      case 'last-week':
        t1.setDate(t1.getDate() - (weekDay + 6));
        t2.setDate(t2.getDate() - (weekDay - 1));
        break;
      case 'this-month':
        t1.setDate(1);
        t2.setMonth(t2.getMonth()+1);
        t2.setDate(1);
        break;
      case 'last-month':
        t1.setMonth(t1.getMonth()-1);
        t1.setDate(1);
        t2.setDate(1);
        break;
      default:
        break;
      }
      return { startTime: t1.getTime(), endTime: t2.getTime() };
    }
  
    it('should return today\'s start and end time for given `now`', () => {
      const now = new Date(2020, 9, 19).getTime();
      const { startTime, endTime } = getTimeRange('today', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-19T16:00:00.000Z');
    });
    it('should return yesterday\'s start and end time for given `now`', () => {
      const now = new Date(2020, 9, 19).getTime();
      const { startTime, endTime } = getTimeRange('yesterday', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-17T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
    });
    it('should return this-week\'s start and end time for given `now`, Sun', () => {
      // 2020-10-12 Mon - 2020-10-19 Mon
      const now = new Date(2020, 9, 18).getTime();
      const { startTime, endTime } = getTimeRange('this-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-11T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
    });
    it('should return this-week\'s start and end time for given `now`, Mon', () => {
      // 2020-10-19 Mon - 2020-10-26 Mon
      const now = new Date(2020, 9, 19).getTime();
      const { startTime, endTime } = getTimeRange('this-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-25T16:00:00.000Z');
    });
    it('should return this-week\'s start and end time for given `now`, Wed', () => {
      // 2020-10-19 Mon - 2020-10-26 Mon
      const now = new Date(2020, 9, 21).getTime();
      const { startTime, endTime } = getTimeRange('this-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-25T16:00:00.000Z');
    });
    it('should return last-week\'s start and end time for given `now`, Sun', () => {
      // 2020-10-05 Mon - 2020-10-12 Mon
      const now = new Date(2020, 9, 18).getTime();
      const { startTime, endTime } = getTimeRange('last-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-04T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-11T16:00:00.000Z');
    });
    it('should return last-week\'s start and end time for given `now`, Mon', () => {
      // 2020-10-12 Mon - 2020-10-19 Mon
      const now = new Date(2020, 9, 19).getTime();
      const { startTime, endTime } = getTimeRange('last-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-11T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
    });
    it('should return last-week\'s start and end time for given `now`, Wed', () => {
      // 2020-10-12 Mon - 2020-10-19 Mon
      const now = new Date(2020, 9, 21).getTime();
      const { startTime, endTime } = getTimeRange('last-week', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-10-11T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-18T16:00:00.000Z');
    });
    it('should return this-month\'s start and end time for given `now`', () => {
      // 2020-10-05 Mon - 2020-10-12 Mon
      const now = new Date(2020, 9, 18).getTime();
      const { startTime, endTime } = getTimeRange('this-month', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-09-30T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-10-31T16:00:00.000Z');
    });
    it('should return this-month\'s start and end time for given `now`, Dec', () => {
      // 2020-10-05 Mon - 2020-10-12 Mon
      const now = new Date(2020, 11, 18).getTime();
      const { startTime, endTime } = getTimeRange('this-month', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-11-30T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-12-31T16:00:00.000Z');
    });
    it('should return last-month\'s start and end time for given `now`', () => {
      // 2020-10-05 Mon - 2020-10-12 Mon
      const now = new Date(2020, 9, 18).getTime();
      const { startTime, endTime } = getTimeRange('last-month', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2020-08-31T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2020-09-30T16:00:00.000Z');
    });
    it('should return last-month\'s start and end time for given `now`, Jan', () => {
      const now = new Date(2020, 0, 18).getTime();
      const { startTime, endTime } = getTimeRange('last-month', now);
      const t1 = new Date(startTime);
      const t2 = new Date(endTime);

      expect(t1.toISOString()).to.be.eql('2019-11-30T16:00:00.000Z');
      expect(t2.toISOString()).to.be.eql('2019-12-31T16:00:00.000Z');
    });
  });
});
