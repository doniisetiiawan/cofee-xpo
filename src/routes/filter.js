export default (M) => {
  const methods = {};

  methods.loadUser = (req, res, next) => {
    const email = req.query.email || req.body.email;
    if (!email) {
      return res
        .status(400)
        .send({
          error:
            'email missing, it should be either in the body or querystring',
        });
    }
    M.User.loadByEmail(email, (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(400)
          .send({
            error: 'email not associated with an user',
          });
      }
      res.locals.user = user;
      next();
    });
  };

  return methods;
};
