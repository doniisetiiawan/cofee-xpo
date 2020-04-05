import path from 'path';
import async from 'async';
import emailTemplates from 'email-templates';

const templatesDir = path.resolve(__dirname, 'templates');

export default (sendMail, models) => {
  const { Meeting } = models;

  function sendForUser(user1, user2, id, date, cb) {
    emailTemplates(templatesDir, (err, template) => {
      if (err) throw err;

      template(
        'followup',
        {
          meetingId: id.toString(),
          user1,
          user2,
          date,
          outcomes: Meeting.outcomes(),
        },
        (err, html) => {
          if (err) throw err;
          sendMail(
            user1.email,
            `How was your meeting with ${user2.name}?`,
            html,
            cb,
          );
        },
      );
    });
  }

  // call done() when both emails are sent
  return function followUp(meeting, done = () => {}) {
    async.parallel(
      [
        (cb) => {
          sendForUser(
            meeting.user1,
            meeting.user2,
            meeting._id,
            meeting.at,
            cb,
          );
        },
        (cb) => {
          sendForUser(
            meeting.user2,
            meeting.user1,
            meeting._id,
            meeting.at,
            cb,
          );
        },
      ],
      done,
    );
  };
};
