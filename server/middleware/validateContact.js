import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  company: z.string().max(150).optional(),
  service: z.enum(['development','design','ai-automation','marketing','3d']).optional(),
  budget: z.enum(['5k-15k','15k-50k','50k-100k','100k+']).optional(),
  message: z.string().min(10).max(3000),
  website: z.string().max(0).optional()
});

export function validateContact(req, res, next) {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: 'Invalid input', errors: result.error.flatten() });
  }
  req.validated = result.data;
  next();
}
