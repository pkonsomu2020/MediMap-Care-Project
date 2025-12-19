import { z } from 'zod';

export const CreateReviewInput = z.object({
  user_id: z.number().int(),
  clinic_id: z.number().int(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});


