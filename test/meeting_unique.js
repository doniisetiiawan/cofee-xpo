import { expect } from 'chai';
import request from 'supertest';
import mocha from 'mocha';
import moment from 'moment';

import timekeeper from 'timekeeper';
import app from '../server';
import dbCleanup from './utils/db';

const {
  describe, it, before, after,
} = mocha;
const models = app.get('models');

describe('Meeting Setup', () => {
  before(dbCleanup);

  after(() => {
    timekeeper.reset();
  });

  let userRes1;
  let userRes2;
  let userRes3;

  it('register user 1', (done) => {
    const seed = Math.random();
    const user = {
      name: `Super1 ${seed}`,
      email: `supertest${seed}@example.com`,
      // setup everyone at the same point for this test so there is no geo concern
      location: [50.0, 50.0],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes1 = res.body;
        done(err);
      });
  });

  it('should be no meeting for one user', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(1);
      const meeting = meetings[0];
      expect(meeting.user1).to.be.an('object');
      expect(meeting.user2).to.be.an('undefined');
      done(err);
    });
  });

  it('register user 2', (done) => {
    const seed = Math.random();
    const user = {
      name: `Super2 ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [50.0, 50.0],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes2 = res.body;
        done(err);
      });
  });

  it('should be a meeting setup with the 2 users', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(1);
      const meeting = meetings[0];
      expect(meeting.user1.email).to.equal(userRes1.email);
      expect(meeting.user2.email).to.equal(userRes2.email);
      done(err);
    });
  });

  it('should try matching an already matched user', (done) => {
    request(app)
      .post('/meeting')
      .send({ email: userRes1.email })
      .expect(412, done);
  });

  it('should travel time', () => {
    const nextNextDay = moment().add(2, 'd');
    timekeeper.travel(nextNextDay.toDate());
    expect(timekeeper.isKeepingTime());
  });

  it('should be able to schedule user 1', (done) => {
    request(app)
      .post('/meeting')
      .send({ email: userRes1.email })
      .expect(200, done);
  });

  it('should be able to schedule user 2', (done) => {
    request(app)
      .post('/meeting')
      .send({ email: userRes2.email })
      .expect(200, done);
  });

  it('verify user 1 and 2 were not matched', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(3);
      expect(meetings[1].user2).to.equal(undefined);
      expect(meetings[2].user2).to.equal(undefined);
      done(err);
    });
  });

  it('register user 3', (done) => {
    const seed = Math.random();
    const user = {
      name: `Super3 ${seed}`,
      email: `supertest${seed}@example.com`,
      location: [50.0, 50.0],
    };

    request(app)
      .post('/user')
      .send(user)
      .expect(200, (err, res) => {
        userRes3 = res.body;
        done(err);
      });
  });

  it('verify user 3 was matched once he was created', (done) => {
    models.Meeting.all((err, meetings) => {
      expect(meetings).to.have.length(3);
      expect(meetings[2].user1.email).to.equal(
        userRes2.email,
      );
      expect(meetings[2].user2.email).to.equal(
        userRes3.email,
      );
      done(err);
    });
  });
});
