// const nodemailer = require('nodemailer');
// const { transporter } = require('../config/email');
// const logger = require('../helpers/logger.helper');

// // Email background job (simple handler)
// exports.sendEmailJob = async (to, subject, html) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     });
//     logger.info(`Email sent to ${to} with subject "${subject}"`);
//   } catch (err) {
//     logger.error(`Failed to send email to ${to}: ${err.message}`);
//   }
// };
const { sendEmail } = require('../helpers/email.helper');
const logger = require('../helpers/logger.helper');

const emailJob = async (emailOptions) => {
    try {
        await sendEmail(emailOptions);
        logger.info(`Email sent to ${emailOptions.to}`);
    } catch (err) {
        logger.error(`Failed to send email to ${emailOptions.to}: ${err.message}`);
    }
};

module.exports = { emailJob };
