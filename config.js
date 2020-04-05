export default (env) => {
  const E = process.env;
  const configs = {};
  configs.env = env;
  configs.dbUrl = `mongodb://localhost/coffee_${env}`;
  configs.email = {
    service: 'Mailgun',
    from: E.MAIL_FROM,
    user: E.MAIL_USER,
    password: E.MAIL_PASSWORD,
  };
  return configs;
};
