import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587 (uses STARTTLS)
  auth: {
    user: process.env.EMAIL_USER || 'skillbridge1011@gmail.com',
    pass: process.env.EMAIL_PASS, // App password
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} html - HTML body content
 */
export async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"Skill Bridge" <${process.env.EMAIL_USER || 'skillbridge1011@gmail.com'}>`,
    to,
    subject,
    html,
  };

  // If no password is set, log instead of trying to send (to avoid errors during local dev if key isn't set yet)
  if (!process.env.EMAIL_PASS) {
    console.warn('\n⚠️ [Mailer] EMAIL_PASS env variable not set! Email was NOT sent to:', to);
    console.log('Subject:', subject);
    console.log('HTML Snippet:', html.substring(0, 300) + '...\n');
    return { success: false, reason: 'EMAIL_PASS not configured' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}
