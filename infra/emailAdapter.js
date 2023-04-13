const nodemailer = require('nodemailer');

const { emailProvider } = require('../config/env');

module.exports = ({ to, subject, content, isHtlm = true}) => {

    to = emailProvider.fakeEmail || to
    const transporter = nodemailer.createTransport({
        service: 'Outlook365',
        auth: {
          user: emailProvider.user,
          pass: emailProvider.pass
        }
      });

      const mailOptions = {
          from: emailProvider.user,
          to:  to,
          subject,
      };

      mailOptions[isHtlm ? 'html' : 'text'] = content

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

};
