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

describe('Appointments API', () => {
  let testUserToken: string;
  let testAppointmentId: number;
  let testClinicId: number;

  const testUser = {
    name: 'Appointment Test User',
    email: 'apptestuser@example.com',
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

    // Create a test clinic for appointment
    const clinicRes = await request(app)
      .post('/api/clinics')
      .send({
        name: 'Test Clinic for Appointment',
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

  describe('POST /api/appointments', () => {
    it('should create a new appointment successfully', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          clinic_id: testClinicId,
          date: '2025-10-10',
          time: '10:00',
          status: 'pending'
        })
        .expect(201);

      expect(response.body).toHaveProperty('appointment_id');
      expect(response.body.clinic_id).toBe(testClinicId);
      expect(response.body.date).toBe('2025-10-10');
      expect(response.body.time).toBe('10:00:00');
      expect(response.body.status).toBe('pending');

      testAppointmentId = response.body.appointment_id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ date: '2025-10-10' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 400 for invalid clinic_id', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          clinic_id: 99999,
          date: '2025-10-10',
          time: '10:00'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid clinic_id');
    });
  });

  describe('GET /api/appointments', () => {
    it('should return list of appointments for user', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return appointment by ID', async () => {
      const response = await request(app)
        .get(`/api/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('appointment_id', testAppointmentId);
      expect(response.body.clinic_id).toBe(testClinicId);
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/99999')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Appointment not found');
    });

    it('should return 403 if appointment does not belong to user', async () => {
      // Assuming appointment with id 1 belongs to another user
      const response = await request(app)
        .get('/api/appointments/1')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Forbidden');
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment successfully', async () => {
      const response = await request(app)
        .put(`/api/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .put('/api/appointments/99999')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'confirmed' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Appointment not found');
    });

    it('should return 403 if appointment does not belong to user', async () => {
      const response = await request(app)
        .put('/api/appointments/1')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'confirmed' })
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Forbidden');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment successfully', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Appointment deleted successfully');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .delete('/api/appointments/99999')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Appointment not found');
    });

    it('should return 403 if appointment does not belong to user', async () => {
      const response = await request(app)
        .delete('/api/appointments/1')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Forbidden');
    });
  });
});
