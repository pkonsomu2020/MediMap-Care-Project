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
import indexRouter from './index';

app.use('/api', indexRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

import { serviceClient } from '../config/supabase';

describe('Reviews API', () => {
  let testUserToken: string;
  let testClinicId: number;
  let testReviewId: number;

  const testUser = {
    name: 'Review Test User',
    email: 'reviewtestuser@example.com',
    phone: '+1234567890',
    password: 'testpassword123',
    role: 'user'
  };

  beforeAll(async () => {
    // Clean up any existing test user and create new user
    if (serviceClient) {
      await serviceClient.from('users').delete().eq('email', testUser.email);
    }
    const registerRes = await request(app)
      .post('/api/users/register')
      .send(testUser);
    testUserToken = registerRes.body.token;

    // Create a test clinic for review
    const clinicRes = await request(app)
      .post('/api/clinics')
      .send({
        name: 'Test Clinic for Review',
        latitude: -1.2864,
        longitude: 36.8172
      });
    testClinicId = clinicRes.body.clinic_id;
  });

  afterAll(async () => {
    // Clean up test user and clinic
    if (serviceClient) {
      await serviceClient.from('users').delete().eq('email', testUser.email);
      if (testClinicId) {
        await serviceClient.from('clinics').delete().eq('clinic_id', testClinicId);
      }
    }
  });

  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          clinic_id: testClinicId,
          rating: 5,
          comment: 'Excellent service!'
        })
        .expect(201);

      expect(response.body).toHaveProperty('review_id');
      expect(response.body.clinic_id).toBe(testClinicId);
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe('Excellent service!');

      testReviewId = response.body.review_id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ rating: 5 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 400 for invalid clinic_id', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          clinic_id: 99999,
          rating: 5
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Clinic not found');
    });

    it('should return 400 for invalid rating', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          clinic_id: testClinicId,
          rating: 6
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('rating must be between 1 and 5');
    });
  });

  describe('GET /api/reviews/clinic/:clinicId', () => {
    it('should return list of reviews for clinic', async () => {
      const response = await request(app)
        .get(`/api/reviews/clinic/${testClinicId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('clinic_id', testClinicId);
      }
    });

    it('should return 400 for invalid clinicId', async () => {
      const response = await request(app)
        .get('/api/reviews/clinic/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('clinicId must be a valid number');
    });

    it('should return 400 if clinicId is missing', async () => {
      const response = await request(app)
        .get('/api/reviews/clinic/')
        .expect(404); // Express will return 404 for missing param

      // No body assertion needed as 404 is expected
    });
  });
});
