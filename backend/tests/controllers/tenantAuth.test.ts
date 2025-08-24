import request from 'supertest';
import express from 'express';
import { tenantAuthRoutes } from '../../src/routes/tenantAuth';
import { TenantService } from '../../src/services/tenantService';

const app = express();
app.use(express.json());
app.use('/api', tenantAuthRoutes);

describe('Tenant Auth Endpoints', () => {
  let testTenant: any;

  beforeAll(async () => {
    const tenantService = new TenantService();
    const result = await tenantService.createTenant({
      name: 'Test Auth Hospital',
      slug: 'test-auth-hospital',
      email: 'admin@authhospital.com',
      password: 'TestPassword123!',
      plan: 'professional'
    });
    testTenant = result.data;
  });

  afterAll(async () => {
    await global.testUtils.cleanup();
  });

  describe('POST /api/tenants/register', () => {
    it('should register a new tenant', async () => {
      const registrationData = {
        name: 'New Test Hospital',
        slug: 'new-test-hospital',
        email: 'admin@newtest.com',
        password: 'NewPassword123!',
        plan: 'basic'
      };

      const response = await request(app)
        .post('/api/tenants/register')
        .send(registrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tenant.name).toBe(registrationData.name);
      expect(response.body.data.tenant.slug).toBe(registrationData.slug);
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        name: '',
        slug: '',
        email: 'invalid-email',
        password: '123',
        plan: 'invalid-plan'
      };

      const response = await request(app)
        .post('/api/tenants/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate slug', async () => {
      const duplicateData = {
        name: 'Duplicate Test',
        slug: testTenant.tenant.slug,
        email: 'duplicate@test.com',
        password: 'TestPassword123!',
        plan: 'basic'
      };

      const response = await request(app)
        .post('/api/tenants/register')
        .send(duplicateData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tenants/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@authhospital.com',
        password: 'TestPassword123!',
        tenantSlug: 'test-auth-hospital'
      };

      const response = await request(app)
        .post('/api/tenants/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tenant).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const invalidLogin = {
        email: 'admin@authhospital.com',
        password: 'wrongpassword',
        tenantSlug: 'test-auth-hospital'
      };

      const response = await request(app)
        .post('/api/tenants/login')
        .send(invalidLogin);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for invalid tenant slug', async () => {
      const invalidTenant = {
        email: 'admin@authhospital.com',
        password: 'TestPassword123!',
        tenantSlug: 'non-existent-tenant'
      };

      const response = await request(app)
        .post('/api/tenants/login')
        .send(invalidTenant);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tenants/:slug/info', () => {
    it('should return tenant info for valid slug', async () => {
      const response = await request(app)
        .get(`/api/tenants/${testTenant.tenant.slug}/info`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(testTenant.tenant.name);
      expect(response.body.data.slug).toBe(testTenant.tenant.slug);
    });

    it('should return 404 for invalid slug', async () => {
      const response = await request(app)
        .get('/api/tenants/non-existent/info');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tenants/refresh', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/tenants/login')
        .send({
          email: 'admin@authhospital.com',
          password: 'TestPassword123!',
          tenantSlug: 'test-auth-hospital'
        });
      
      validToken = loginResponse.body.data.token;
    });

    it('should refresh token with valid token', async () => {
      const response = await request(app)
        .post('/api/tenants/refresh')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(validToken);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/tenants/refresh');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/tenants/refresh')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});