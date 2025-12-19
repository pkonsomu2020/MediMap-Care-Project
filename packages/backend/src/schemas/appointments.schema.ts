import { z } from 'zod';

export const CreateAppointmentInput = z.object({
  user_id: z.number().int(),
  clinic_id: z.number().int(),
  date: z.string(),
  time: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});

export const UpdateAppointmentInput = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});


