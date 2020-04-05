import { CronJob } from 'cron';

import followupMail from './followupMail';

export default (models, mailer) => {
  const tasks = {};

  tasks.followupMail = followupMail(
    models,
    mailer,
  );

  tasks.init = () => {
    // lock seconds at 0, every 15 minutes do:
    new CronJob(
      '00 */15 * * * *',
      tasks.followupMail,
    ).start();
  };

  return tasks;
};
