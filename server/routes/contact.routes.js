import express from 'express';
import { contactRateLimiter } from '../middleware/rateLimiter.js';
import { honeypot } from '../middleware/honeypot.js';
import { validateContact } from '../middleware/validateContact.js';
import { submitContact } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/contact', contactRateLimiter, honeypot, validateContact, submitContact);

export default router;