import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { buildCors } from '../config/cors';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(buildCors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import indexRouter from '../routes/index';

app.use('/api', indexRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /api/ready', () => {
    it('should return ready status', async () => {
      const response = await request(app)
        .get('/api/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ready');
    });
  });

  describe('GET /api/live', () => {
    it('should return live status', async () => {
      const response = await request(app)
        .get('/api/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('live');
    });
  });
});
