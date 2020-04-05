import async from 'async';

import configcwfxq from '../../config';
import models from '../../src/models';

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';

export default (finish) => {
  const config = configcwfxq(process.env.NODE_ENV);
  models(config.dbUrl);
  const collections = [];
  for (const k in models) collections.push(models[k].collection);
  async.each(
    collections,
    (collection, cb) => {
      collection.remove({}, cb);
    },
    // eslint-disable-next-line no-unused-vars
    (err) => {
      finish();
    },
  );
};
