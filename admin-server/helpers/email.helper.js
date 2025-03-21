const nodemailer = require('nodemailer');
const logger = require('./logger.helper');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      ...(options.html && { html: options.html })
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 */
const sendOTPEmail = async (email, otp) => {
  const subject = 'Your OTP for Authentication';
  const text = `Your OTP is: ${otp}. This OTP will expire in 10 minutes.`;
  const html = `
    <h2>Authentication Required</h2>
    <p>Your One-Time Password (OTP) is:</p>
    <h1 style="color: #4CAF50;">${otp}</h1>
    <p>This OTP will expire in 10 minutes.</p>
    <p>If you didn't request this OTP, please ignore this email.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send application status update email
 * @param {string} email - Recipient email
 * @param {string} status - Application status
 * @param {string} businessName - Business name
 */
const sendApplicationStatusEmail = async (email, status, businessName) => {
  const subject = `Application Status Update - ${businessName}`;
  const text = `Your application for ${businessName} has been ${status}.`;
  const html = `
    <h2>Application Status Update</h2>
    <p>Dear User,</p>
    <p>Your application for <strong>${businessName}</strong> has been <strong>${status}</strong>.</p>
    <p>Please log in to your account to view more details.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send welcome email to new tenant
 * @param {string} email - Recipient email
 * @param {string} businessName - Business name
 */
const sendWelcomeEmail = async (email, businessName) => {
  const subject = `Welcome to Meta-SAAS - ${businessName}`;
  const text = `Welcome to Meta-SAAS! Your business ${businessName} has been successfully registered.`;
  const html = `
    <h2>Welcome to Meta-SAAS!</h2>
    <p>Dear ${businessName},</p>
    <p>Welcome aboard! Your business has been successfully registered with Meta-SAAS.</p>
    <p>You can now access all our features by logging into your account.</p>
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendApplicationStatusEmail,
  sendWelcomeEmail
};
