import express from 'express';

import usercyrqh from './user';
import errorHandlerpmhkr from './errorHandler';
import filterihjrt from './filter';
import meetingjfuus from './meeting';

const router = express.Router();

export default (Models) => {
  const user = usercyrqh(Models);
  const filter = filterihjrt(Models);
  const meeting = meetingjfuus(Models);
  const errorHandler = errorHandlerpmhkr();

  router.post('/user', user.create);
  router.post('/meeting', [filter.loadUser], meeting.create);
  router.get('/me', [filter.loadUser], user.me);
  router.get('/followup/:meetingId/:reviewedUserId/:feedback', meeting.followUp);

  router.use(errorHandler.catchAll);

  return router;
};
