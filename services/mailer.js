const nodemailer = require('nodemailer')
const ejs = require('ejs')

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECURE,
  auth: {
    user: process.env.MAILER_USERNAME,
    pass: process.env.MAILER_PASSWORD,
  },
})

module.exports = {
  sendNotification: async function (sendTo, { subject, body, debitRatio }) {
    ejs.renderFile(__dirname + '/../views/notification.ejs', {
      subject,
      body,
      debitRatio,
    }, {}, (err, html) => {
      return new Promise((resolve, reject) => {
        resolve(transporter.sendMail({
          from: `"LiquityAppSupport" <${process.env.MAILER_USERNAME}>`,
          to: sendTo,
          subject: subject,
          html: html,
        }))
      });
    });
  },
}
