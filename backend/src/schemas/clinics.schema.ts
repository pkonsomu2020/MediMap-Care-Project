import { z } from 'zod';

export const CreateClinicInput = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  latitude: z.union([z.string(), z.number()]),
  longitude: z.union([z.string(), z.number()]),
  services: z.string().optional(),
  consultation_fee: z.union([z.string(), z.number()]).optional(),
  contact: z.string().optional(),
});

export const QueryClinicsInput = z.object({
  q: z.string().optional(),
  min_rating: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});


