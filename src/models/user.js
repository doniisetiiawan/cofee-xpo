export default (db) => {
  const methods = {};
  const User = db.collection('users');
  methods.collection = User;

  methods.create = (name, email, location, cb) => {
    User.insert(
      {
        name,
        email,
        location,
      },
      cb,
    );
  };

  methods.loadByEmail = (email, cb) => {
    User.findOne({ email }, cb);
  };

  return methods;
};
