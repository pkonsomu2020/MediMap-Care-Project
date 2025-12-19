import request from 'supertest';
import app from '../app';
import { serviceClient } from '../config/supabase';

describe('Users API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Clean up any existing test users
    await serviceClient!.from('users').delete().eq('email', 'test@example.com');
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await serviceClient!.from('users').delete().eq('user_id', testUser.user_id);
    }
  });

  describe('POST /users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.phone).toBe(userData.phone);
      expect(response.body.user.role).toBe(userData.role);

      testUser = response.body.user;
      authToken = response.body.token;
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('User already exists');
    });

    it('should return 400 if required fields are missing', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Name, email and password are required');
    });
  });

  describe('POST /users/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 if required fields are missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user_id).toBe(testUser.user_id);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.phone).toBe(testUser.phone);
      expect(response.body.role).toBe(testUser.role);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });
});
