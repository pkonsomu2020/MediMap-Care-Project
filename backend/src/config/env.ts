import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Explicitly load .env from the 'backend' directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8001'),
  CORS_ORIGIN: z.string().optional(),
  // Required for backend operation
  SUPABASE_URL: z.string().url({
    message: 'SUPABASE_URL is required and must be a valid URL',
  }),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: 'SUPABASE_SERVICE_ROLE_KEY is required',
  }),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.log(process.env)
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  ...parsed.data,
  portNumber: parseInt(parsed.data.PORT || '8001', 10),
};