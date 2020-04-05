export default (Model) => {
  const methods = {};

  methods.create = (req, res, next) => {
    Model.User.create(
      req.body.name,
      req.body.email,
      req.body.location,
      (err, user) => {
        if (err) return next(err);

        // eslint-disable-next-line no-unused-vars
        Model.Meeting.pair(user, (err, meeting) => {
          res.send(user);
        });
      },
    );
  };

  methods.me = (req, res) => {
    res.send(res.locals.user);
  };

  return methods;
};
