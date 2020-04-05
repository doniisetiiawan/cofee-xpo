import { expect } from 'chai';
import request from 'supertest';
import mocha from 'mocha';

import dbCleanup from './utils/db';
import app from '../server';

const { describe, it, before } = mocha;
const models = app.get('models');

describe('Meeting Setup', () => {
  before(dbCleanup);

  // Santiago
  let userRes1;

  let userRes2;

  // Vancouver
  // eslint-disable-next-line no-unused-vars
  let userRes3;

  // Valparaiso
  let userRes4;

  let userRes5;

  it('create user 1 in Santiago', (done) => {
    const seed = Math.random();
    const user = {
      name: `Santiago ${seed}`,
      email: `supertest${seed}@example.com`,
      // longitude, latitude
      location: [-70.641997, -33.46912],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes1 = res.body;
        done(err);
      });
  });

  it('create user 4 in Valparaiso', (done) => {
    const seed = Math.random();
    const user = {
      name: `Valparaiso ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [-71.642972, -33.021473],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes4 = res.body;
        done(err);
      });
  });

  it('check there is no match', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(2);
      done(err);
    });
  });

  it('create user 2 in Santiago', (done) => {
    const seed = Math.random();
    const user = {
      name: `Santiago ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [-70.642304, -33.439598],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes2 = res.body;
        done(err);
      });
  });

  it('check there was a match between 1 & 2', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(2);
      const meeting = meetings[0];
      expect(meeting.user1.email).to.equal(userRes1.email);
      expect(meeting.user2.email).to.equal(userRes2.email);
      done(err);
    });
  });

  it('create user 3 in Vancouver', (done) => {
    const seed = Math.random();
    const user = {
      name: `Vancouver ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [-123.113927, 49.261226],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes3 = res.body;
        done(err);
      });
  });

  it('check 3 have no match', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(3);
      done(err);
    });
  });

  it('create user 5 in Valparaiso', (done) => {
    const seed = Math.random();
    const user = {
      name: `Vancouver ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [-71.62424, -33.048446],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes5 = res.body;
        done(err);
      });
  });

  it('check there was a match between 4 & 5', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(3);
      const meeting = meetings[1];
      expect(meeting.user1.email).to.equal(userRes4.email);
      expect(meeting.user2.email).to.equal(userRes5.email);
      done(err);
    });
  });
});
