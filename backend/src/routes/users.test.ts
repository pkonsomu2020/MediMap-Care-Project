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

describe('Users API', () => {
  let testUser: any = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    password: 'testpassword123',
    role: 'user'
  };

  let authToken: string;

  beforeAll(async () => {
    // Clean up any existing test user
    if (serviceClient) {
      await serviceClient.from('users').delete().eq('email', testUser.email);
    }
  });

  afterAll(async () => {
    // Clean up test user after tests
    if (serviceClient) {
      await serviceClient.from('users').delete().eq('email', testUser.email);
    }
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('user_id');
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe(testUser.role);

      authToken = response.body.token;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 409 if user already exists', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
