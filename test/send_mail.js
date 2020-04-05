import mocha from 'mocha';
import dbCleanup from './utils/db';

import app from '../server';

const mailer = app.get('mailer');

const { describe, it } = mocha;

describe('Meeting Setup', () => {
  it('just send one.', function (done) {
    this.timeout(10 * 1000);
    mailer.send(
      'fabianosoriani@gmail.com',
      `Test ${new Date().toLocaleString()}`,
      `BOdy ${Math.random()}<br>${Math.random()}`,
      done,
    );
  });
});
