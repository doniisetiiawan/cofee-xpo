export default (Model) => {
  const methods = {};

  methods.create = (req, res, next) => {
    const { user } = res.locals;
    Model.Meeting.isUserScheduled(
      user,
      (err, isScheduled) => {
        if (err) return next(err);
        if (isScheduled) {
          return res
            .status(412)
            .send({ error: 'user is already scheduled' });
        }
        // eslint-disable-next-line no-unused-vars
        Model.Meeting.pair(user, (err, result) => {
          if (err) return next(err);
          res.send({});
        });
      },
    );
  };

  methods.followUp = (req, res, next) => {
    const meetingId = req.param('meetingId');
    const reviewedUserId = req.param('reviewedUserId');
    const feedback = req.param('feedback');
    // validate feedback
    if (!(feedback in Model.Meeting.outcomes())) {
      return res
        .status(400)
        .send('Feedback not recognized');
    }
    Model.Meeting.didMeetingHappened(
      meetingId,
      (err, itDid) => {
        if (err) {
          if (
            err.message == 'no meeting found by this id'
          ) {
            return res.status(404).send(err.message);
          }
          return next(err);
        }
        if (!itDid) {
          return res
            .status(412)
            .send(
              "The meeting didn't happen yet, come back later!",
            );
        }
        Model.Meeting.rate(
          meetingId,
          reviewedUserId,
          feedback,
          (err, userName, text) => {
            if (err) return next(err);
            res.send(
              `You just rated your meeting with ${userName} as ${text}. Thanks!`,
            );
          },
        );
      },
    );
  };

  return methods;
};
