import { Application } from '../declarations';
import users from './users/users.service';
import ticks from './ticks/ticks.service';
import popularActivities from './popular-activities/popular-activities.service';
import popularTags from './popular-tags/popular-tags.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(ticks);
  app.configure(popularActivities);
  app.configure(popularTags);
}