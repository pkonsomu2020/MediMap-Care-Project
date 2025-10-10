import cors, { CorsOptions } from 'cors';
import { env } from './env';

export function buildCors() {
  const origin = env.CORS_ORIGIN || '*';
  const allowedOrigins = typeof origin === 'string' ? origin.split(',') : origin;
  
  const options: CorsOptions = {
    origin: allowedOrigins,
    credentials: true,
  };
  return cors(options);
}
