import express from 'express';

import usercyrqh from './user';
import errorHandlerpmhkr from './errorHandler';

const router = express.Router();

export default (Models) => {
  const user = usercyrqh(Models);
  const errorHandler = errorHandlerpmhkr();

  router.post('/user', user.create);

  router.use(errorHandler.catchAll);

  return router;
};
