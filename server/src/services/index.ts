import { Application } from '../declarations';
import users from './users/users.service';
import ticks from './ticks/ticks.service';
import activities from './activities/activities.service';
import tags from './tags/tags.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(ticks);
  app.configure(activities);
  app.configure(tags);
}
