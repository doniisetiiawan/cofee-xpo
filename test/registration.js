import { expect } from 'chai';
import request from 'supertest';
import mocha from 'mocha';

import dbCleanup from './utils/db';
import app from '../server';

const { describe, it, before } = mocha;

describe('Registration', () => {
  before(dbCleanup);

  it('shoots a valid request', (done) => {
    const seed = Math.random();
    const user = {
      name: `Super${seed}`,
      email: `supertest${seed}@example.com`,
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        const userRes = res.body;
        expect(userRes._id).to.be.a('string');
        expect(userRes.name).to.equal(user.name);
        expect(userRes.email).to.equal(user.email);
        done(err);
      });
  });
});
