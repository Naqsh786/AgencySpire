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

  const escapeHtml = (s) => String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  const eName = escapeHtml(safeName);
  const eEmail = escapeHtml(safeEmail);
  const eCompany = escapeHtml(safeCompany);
  const eService = escapeHtml(safeService);
  const eBudget = escapeHtml(safeBudget);
  const eMessage = escapeHtml(safeMessage).replace(/\n/g,'<br>');

  const text = `New AgencySpire Contact Inquiry

Name: ${safeName}
Email: ${safeEmail}
Company: ${safeCompany}
Service: ${safeService}
Budget: ${safeBudget}
Message:
${safeMessage}

Submitted: ${new Date().toISOString()}`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:24px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
<tr>
<td style="padding:28px 28px 18px;background:#0a0a0b;color:#ffffff;">
<h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:0.02em;">AgencySpire</h1>
<p style="margin:6px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.85;">New Contact Inquiry</p>
</td>
</tr>
<tr>
<td style="padding:28px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:12px 0;font-size:14px;color:#111111;"><strong style="display:inline-block;width:100px;color:#555555;">Name</strong> ${eName}</td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#111111;"><strong style="display:inline-block;width:100px;color:#555555;">Email</strong> <a href="mailto:${eEmail}" style="color:#1a73e8;text-decoration:none;">${eEmail}</a></td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#111111;"><strong style="display:inline-block;width:100px;color:#555555;">Company</strong> ${eCompany}</td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#111111;"><strong style="display:inline-block;width:100px;color:#555555;">Service</strong> ${eService}</td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#111111;"><strong style="display:inline-block;width:100px;color:#555555;">Budget</strong> ${eBudget}</td></tr>
</table>
<div style="margin-top:22px;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
<div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#666666;margin-bottom:8px;">Message</div>
<div style="font-size:14px;line-height:1.6;color:#111111;white-space:pre-wrap;">${eMessage}</div>
</div>
</td>
</tr>
<tr>
<td style="padding:18px 28px 28px;color:#666666;font-size:12px;border-top:1px solid #f0f0f0;">
<div style="font-weight:600;color:#111111;margin-bottom:4px;">AgencySpire</div>
<div>Creative • Digital • Technology</div>
<div style="margin-top:8px;font-size:11px;color:#999999;">Submitted ${new Date().toISOString()}</div>
</td>
</tr>
</table>
</div>
</body>
</html>`;

  const tp = getTransporter();
  if (!tp) {
    console.log('EMAIL (dev):', text);
    return { success: true };
  }

  const info = await tp.sendMail({
    from: `AgencySpire <${process.env.SMTP_USER}>`,
    to,
    replyTo: safeEmail,
    subject: `New AgencySpire Contact Inquiry — ${safeName}`,
    text,
    html
  });

  return { success: true, messageId: info.messageId };
}
