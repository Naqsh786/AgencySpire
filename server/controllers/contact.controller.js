import { sendContactEmail } from '../services/email.service.js';

export async function submitContact(req, res, next) {
  try {
    await sendContactEmail(req.validated);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    next(err);
  }
}