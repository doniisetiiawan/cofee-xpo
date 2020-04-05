import mongojs from 'mongojs';

import user from './user';
import meeting from './meeting';

export default (dbUrl) => {
  console.log(dbUrl);
  const db = mongojs(dbUrl);
  return {
    User: user(db),
    Meeting: meeting(db),
  };
};
