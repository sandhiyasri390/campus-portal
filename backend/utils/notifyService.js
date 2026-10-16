const Notification = require('../models/Notification');
const User = require('../models/User');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Creates an in-app notification, and sends an email if SMTP is configured.
 * Falls back silently to in-app-only storage otherwise — the app always works.
 */
async function notify({ recipient, title, message, type = 'general', relatedJob, relatedApplication }) {
  const notification = await Notification.create({
    recipient, title, message, type, relatedJob, relatedApplication,
  });

  const t = getTransporter();
  if (t) {
    try {
      const user = await User.findById(recipient);
      if (user && user.email) {
        await t.sendMail({
          from: process.env.EMAIL_FROM || 'Campus Placement Portal <no-reply@campusplacement.com>',
          to: user.email,
          subject: title,
          text: message,
        });
        notification.emailSent = true;
        await notification.save();
      }
    } catch (err) {
      console.warn('[notify] email send failed, notification stored in-app only:', err.message);
    }
  }

  return notification;
}

async function notifyMany(recipients, payload) {
  return Promise.all(recipients.map((recipient) => notify({ ...payload, recipient })));
}

module.exports = { notify, notifyMany };
