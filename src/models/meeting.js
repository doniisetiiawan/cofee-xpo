import moment from 'moment';

export default (db) => {
  const methods = {};
  const User = db.collection('users');
  const Meeting = db.collection('meetings');
  methods.collection = Meeting;

  Meeting.ensureIndex({ location1: '2dsphere' });

  const arrangeTime = () => {
    const time = moment().add(1, 'd');
    time.hour(12);
    time.minute(0);
    time.second(0);
    return time.toDate();
  };

  /**
   * Try finding the user scheduled in meeting, if it happens, return `false`
   * cb(err,true||false)
   */
  methods.isUserScheduled = (user, cb) => {
    Meeting.count({
      $or: [
        { 'user1.email': user.email },
        { 'user2.email': user.email },
      ],
      at: { $gt: new Date() },
    }, (err, count) => {
      // console.log("isUserScheduled?", user.email, count > 0 ? 'yes' : 'no')
      cb(err, count > 0);
    });
  };

  /**
   * the callback returns an array with emails that have previously been
   * matched with this user
   */
  methods.userMatchHistory = (user, cb) => {
    const { email } = user;
    Meeting.find({
      $or: [
        { 'user1.email': email },
        { 'user2.email': email },
      ],
      user1: { $exists: true },
      user2: { $exists: true },
    }, (err, meetings) => {
      if (err) return cb(err);
      const pastMatches = meetings.map((m) => {
        if (m.user1.email != email) return m.user1.email;
        return m.user2.email;
      });
      // avoid matching themselves!
      pastMatches.push(user.email);
      cb(null, pastMatches);
    });
  };

  methods.pair = (user, done) => {
    // find the people we shouldn't be matched with again
    methods.userMatchHistory(user, (err, emailList) => {
      if (err) return done(err);

      /**
       * Try to find an unpaired User in Meeting collection,
       * at the same time, update with an pair id
       * 1. If fail, add the new created user to  Meeting collection
       * 2. If success, the newly created user was added to a Meeting document
       */
      Meeting.findAndModify({
        new: true,
        query: {
          user2: { $exists: false },
          'user1.email': { $nin: emailList },
          location1: {
            $nearSphere: {
              $geometry:
                {
                  type: 'Point',
                  coordinates: user.location,
                },
              $maxDistance: 7 * 1000,
            },
          },
        },
        update: {
          $set: {
            user2: user,
            at: arrangeTime(),
          },
        },
      }, (err, newPair) => {
        if (err) { return done(err); }

        if (newPair) {
          done(null, newPair);
        }

        // no user alone
        if (!newPair) {
          Meeting.insert({
            user1: user,
            location1: user.location,
            // eslint-disable-next-line no-unused-vars
          }, (err, meeting) => {
            done();
          });
        }
      });
    });
  };

  methods.outcomes = () => ({
    awesome: 'It was awesome',
    awful: 'It was awful',
    meh: 'Meh',
    noshow: "My pair didn't show up!",
  });

  // cb(err, itDid)
  methods.didMeetingHappened = (meetingId, cb) => {
    if (!db.ObjectId.isValid(meetingId)) return cb(new Error('bad ObjectId'));
    Meeting.findOne({
      user1: { $exists: true },
      user2: { $exists: true },
      _id: new db.ObjectId(meetingId),
    }, (err, meeting) => {
      if (err) return cb(err);
      if (!meeting) return cb(new Error('no meeting found by this id'));
      if (meeting.at > new Date()) return cb(null, false);
      cb(null, true);
    });
  };

  // cb(err, userName, text)
  methods.rate = (meetingId, reviewedUserId, feedback, cb) => {
    Meeting.findOne({
      _id: new db.ObjectId(meetingId),
    }, (err, meeting) => {
      if (err) return cb(err);
      const update = {};

      const targetUser = (meeting.user1._id.toString() == reviewedUserId) ? '1' : '2';
      update[`user${targetUser}reviewed`] = feedback;
      Meeting.findAndModify({
        new: true,
        query: {
          _id: new db.ObjectId(meetingId),
        },
        update: {
          $set: update,
        },
      }, (err, meeting) => {
        if (err) return cb(err);
        const userName = (meeting[`user${targetUser}`].name);
        const text = methods.outcomes()[feedback];
        cb(null, userName, text);
      });
    });
  };

  // all meetings that are due and not mailed yet
  methods.needMailing = (cb) => {
    Meeting.find({
      at: { $lt: new Date() },
      mailed: { $exists: false },
    }, cb);
  };

  // mark a meeting as mailed
  methods.markAsMailed = (id, cb) => {
    Meeting.findAndModify({
      query: {
        _id: id,
      },
      update: {
        $set: { mailed: new Date() },
      },
    }, cb);
  };

  methods.all = (cb) => {
    Meeting.find({}).sort({ _id: 1 }, cb);
  };

  return methods;
};
