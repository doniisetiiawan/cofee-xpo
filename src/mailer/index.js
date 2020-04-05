import nodemailer from 'nodemailer';
import stubTransport from 'nodemailer-stub-transport';

import followUp from './followUp';

export default (mailConfig, models) => {
  const methods = {};
  let transporter;

  // Setup transport
  if (process.env.NODE_ENV == 'test') {
    transporter = nodemailer.createTransport(
      stubTransport(),
    );
  } else if (mailConfig.service === 'Mailgun') {
    transporter = nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });
  } else {
    throw new Error('email service missing');
  }

  // define a simple function to deliver mails
  methods.send = (recipients, subject, body, cb) => {
    // small trick to ensure dev & tests emails go to myself
    if (process.env.NODE_ENV != 'production') recipients = ['my.own.email@provider.com'];
    transporter.sendMail(
      {
        to: recipients,
        from: mailConfig.from,
        subject,
        generateTextFromHTML: true,
        html: body,
      },
      (err, info) => {
        // console.info("nodemailer::send",err,info)
        if (typeof cb == 'function') {
          cb(err, info);
        }
      },
    );
  };

  methods.followUp = followUp(
    methods.send,
    models,
  );

  return methods;
};
