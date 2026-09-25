import nodemailer from 'nodemailer';
import { sanitizeInput } from '../utils/sanitize.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    console.warn('Email SMTP not configured, emails will be logged instead');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  return transporter;
}

export async function sendContactEmail(data) {
  const { name, email, company, service, budget, message } = data;
  const to = process.env.CONTACT_TO_EMAIL || 'hello@agencyspire.com';

  const safeName = sanitizeInput(name);
  const safeEmail = sanitizeInput(email);
  const safeCompany = company ? sanitizeInput(company) : '-';
  const safeService = service ? sanitizeInput(service) : '-';
  const safeBudget = budget ? sanitizeInput(budget) : '-';
  const safeMessage = sanitizeInput(message);

  const text = `New AgencySpire Contact Inquiry

Name: ${safeName}
Email: ${safeEmail}
Company: ${safeCompany}
Service: ${safeService}
Budget: ${safeBudget}
Message:
${safeMessage}

Submitted: ${new Date().toISOString()}`;

  const html = `<h2>New AgencySpire Contact Inquiry</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<p><strong>Company:</strong> ${safeCompany}</p>
<p><strong>Service:</strong> ${safeService}</p>
<p><strong>Budget:</strong> ${safeBudget}</p>
<p><strong>Message:</strong><br>${safeMessage.replace(/\n/g, '<br>')}</p>
<hr>
<p><small>Submitted: ${new Date().toISOString()}</small></p>`;

  const tp = getTransporter();
  if (!tp) {
    console.log('EMAIL (dev):', text);
    return { success: true };
  }

  const info = await tp.sendMail({
    from: `AgencySpire <${process.env.SMTP_USER}>`,
    to,
    replyTo: safeEmail,
    subject: 'New Contact Inquiry - AgencySpire',
    text,
    html
  });

  return { success: true, messageId: info.messageId };
}