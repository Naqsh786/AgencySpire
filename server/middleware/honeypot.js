export function honeypot(req, res, next) {
  if (req.body && req.body.website) {
    return res.status(200).json({ success: true, message: 'Message received' });
  }
  next();
}
