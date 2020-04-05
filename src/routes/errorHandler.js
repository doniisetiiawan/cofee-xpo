export default () => {
  const methods = {};

  // eslint-disable-next-line no-unused-vars
  methods.catchAll = (err, req, res, next) => {
    console.warn('catchAll ERR:', err);
    res.status(500).send({
      error: err.toString ? err.toString() : err,
    });
  };

  return methods;
};
