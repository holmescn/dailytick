import { Application } from '../declarations';
import users from './users/users.service';
import ticks from './ticks/ticks.service';
import tags from './tags/tags.service';
import suggestActivities from './suggest-activities/suggest-activities.service';
import exportCsv from './export-csv/export-csv.service';
import activityTags from './activity-tags/activity-tags.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(ticks);
  app.configure(tags);
  app.configure(suggestActivities);
  app.configure(exportCsv);
  app.configure(activityTags);
}
