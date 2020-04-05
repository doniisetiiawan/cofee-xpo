export default (M, mailer) => () => {
  // console.log("running task..", new Date)
  M.Meeting.needMailing((err, meetings) => {
    if (err) return console.warn('needMailing', err);
    if (!meetings || meetings.length < 1) return;
    meetings.forEach((meeting) => {
      mailer.followUp(meeting, (err) => {
        if (err) {
          return console.warn(
            `needMailing followup failed ${meeting._id.toString()}`,
            err,
          );
        }
        M.Meeting.markAsMailed(meeting._id);
      });
    });
    M.Meeting.markAsMailed(meetings);
  });
};
