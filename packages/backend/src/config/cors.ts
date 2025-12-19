import cors, { CorsOptions } from 'cors';
import { env } from './env';

export function buildCors() {
  const origin = env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = typeof origin === 'string' ? origin.split(',') : origin;

  const options: CorsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // In development, allow all localhost ports
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment && origin.match(/^http:\/\/localhost:\d+$/)) {
        callback(null, true);
        return;
      }
      
      // Check against configured allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
  return cors(options);
}
