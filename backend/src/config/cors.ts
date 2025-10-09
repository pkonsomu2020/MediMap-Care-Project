import cors, { CorsOptions } from 'cors';
import { env } from './env';

export function buildCors() {
  const origin = env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000';
  const allowedOrigins = typeof origin === 'string' ? origin.split(',') : origin;

  const options: CorsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
  return cors(options);
}
