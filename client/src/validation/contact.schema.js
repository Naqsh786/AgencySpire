import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address').max(254, 'Email is too long'),
  company: z.string().max(150, 'Company must be at most 150 characters').optional().or(z.literal('')),
  service: z.enum(['development','design','ai-automation','marketing','3d']).optional().or(z.literal('')),
  budget: z.enum(['5k-15k','15k-50k','50k-100k','100k+']).optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000, 'Message must be at most 3000 characters'),
  website: z.string().max(0, 'Leave this empty').optional().or(z.literal('')),
});
