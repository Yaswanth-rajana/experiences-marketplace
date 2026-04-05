import { z } from 'zod';

export const createExperienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  price: z.number().int().min(0, 'Price must be 0 or greater'),
  start_time: z.string().datetime({ message: 'Invalid date format' })
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;