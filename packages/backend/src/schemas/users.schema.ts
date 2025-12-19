import { z } from 'zod';

export const RegisterInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['user', 'clinic', 'admin']).optional(),
});

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const UserUpdateInput = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_info: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
});