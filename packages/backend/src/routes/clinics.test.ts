import request from 'supertest';
import app from '../app';
import { serviceClient } from '../config/supabase';

describe('Clinics API', () => {
  let testClinic: any = {
    name: 'Test Clinic',
    address: '123 Test Street',
    latitude: -1.2864,
    longitude: 36.8172,
    services: 'General Practice, Pediatrics',
    consultation_fee: 5000,
    contact: '+254712345678'
  };

  let createdClinicId: number;

  beforeAll(async () => {
    // Clean up any existing test clinic
    if (serviceClient) {
      await serviceClient.from('clinics').delete().eq('name', testClinic.name);
    }
  });

  afterAll(async () => {
    // Clean up test clinic after tests
    if (serviceClient && createdClinicId) {
      await serviceClient.from('clinics').delete().eq('clinic_id', createdClinicId);
    }
  });

  describe('POST /api/clinics', () => {
    it('should create a new clinic successfully', async () => {
      const response = await request(app)
        .post('/api/clinics')
        .send(testClinic)
        .expect(201);

      expect(response.body).toHaveProperty('clinic_id');
      expect(response.body.name).toBe(testClinic.name);
      expect(response.body.address).toBe(testClinic.address);
      expect(response.body.latitude).toBe(testClinic.latitude);
      expect(response.body.longitude).toBe(testClinic.longitude);
      expect(response.body.services).toBe(testClinic.services);
      expect(response.body.consultation_fee).toBe(testClinic.consultation_fee);
      expect(response.body.contact).toBe(testClinic.contact);

      createdClinicId = response.body.clinic_id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/clinics')
        .send({ name: 'Test Clinic' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/clinics', () => {
    it('should return list of clinics', async () => {
      const response = await request(app)
        .get('/api/clinics')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter clinics by search query', async () => {
      const response = await request(app)
        .get('/api/clinics?q=Test')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body.some((clinic: any) => clinic.name.includes('Test'))).toBe(true);
      }
    });

    it('should filter clinics by minimum rating', async () => {
      const response = await request(app)
        .get('/api/clinics?min_rating=4.0')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((clinic: any) => {
        if (clinic.rating !== null) {
          expect(clinic.rating).toBeGreaterThanOrEqual(4.0);
        }
      });
    });
  });

  describe('GET /api/clinics/:id', () => {
    it('should return clinic by ID', async () => {
      const response = await request(app)
        .get(`/api/clinics/${createdClinicId}`)
        .expect(200);

      expect(response.body).toHaveProperty('clinic_id', createdClinicId);
      expect(response.body.name).toBe(testClinic.name);
    });

    it('should return 404 for non-existent clinic', async () => {
      const response = await request(app)
        .get('/api/clinics/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Clinic not found');
    });
  });

  describe('PUT /api/clinics/:id', () => {
    it('should update clinic successfully', async () => {
      const updateData = {
        name: 'Updated Test Clinic',
        consultation_fee: 6000
      };

      const response = await request(app)
        .put(`/api/clinics/${createdClinicId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.consultation_fee).toBe(updateData.consultation_fee);
    });

    it('should return 404 for non-existent clinic', async () => {
      const response = await request(app)
        .put('/api/clinics/99999')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Clinic not found');
    });
  });

  describe('DELETE /api/clinics/:id', () => {
    it('should delete clinic successfully', async () => {
      const response = await request(app)
        .delete(`/api/clinics/${createdClinicId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Clinic deleted successfully');
    });

    it('should return 404 for non-existent clinic', async () => {
      const response = await request(app)
        .delete('/api/clinics/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Clinic not found');
    });
  });
});
