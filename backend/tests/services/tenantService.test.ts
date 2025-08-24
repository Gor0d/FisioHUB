import { TenantService } from '../../src/services/tenantService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('TenantService', () => {
  let tenantService: TenantService;

  beforeAll(() => {
    tenantService = new TenantService();
  });

  afterEach(async () => {
    await global.testUtils.cleanup();
  });

  describe('createTenant', () => {
    it('should create a new tenant successfully', async () => {
      const tenantData = {
        name: 'Test Hospital',
        slug: 'test-hospital-create',
        email: 'admin@testhospital.com',
        password: 'TestPassword123!',
        plan: 'professional' as const
      };

      const result = await tenantService.createTenant(tenantData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.tenant.name).toBe(tenantData.name);
      expect(result.data.tenant.slug).toBe(tenantData.slug);
      expect(result.data.admin).toBeDefined();
      expect(result.data.admin.email).toBe(tenantData.email);
      expect(result.data.schema).toBeDefined();
    });

    it('should not create tenant with duplicate slug', async () => {
      const tenantData = {
        name: 'Test Hospital',
        slug: 'duplicate-slug',
        email: 'admin@hospital1.com',
        password: 'TestPassword123!',
        plan: 'professional' as const
      };

      // Create first tenant
      await tenantService.createTenant(tenantData);

      // Attempt to create second tenant with same slug
      const duplicateData = {
        ...tenantData,
        name: 'Another Hospital',
        email: 'admin@hospital2.com'
      };

      const result = await tenantService.createTenant(duplicateData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('slug');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        slug: '',
        email: 'invalid-email',
        password: '123',
        plan: 'professional' as const
      };

      const result = await tenantService.createTenant(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('getTenantBySlug', () => {
    it('should retrieve tenant by slug', async () => {
      const tenantData = {
        name: 'Test Hospital Get',
        slug: 'test-hospital-get',
        email: 'admin@gethospital.com',
        password: 'TestPassword123!',
        plan: 'professional' as const
      };

      const created = await tenantService.createTenant(tenantData);
      const result = await tenantService.getTenantBySlug(tenantData.slug);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.slug).toBe(tenantData.slug);
    });

    it('should return null for non-existent tenant', async () => {
      const result = await tenantService.getTenantBySlug('non-existent-slug');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('updateTenantSubscription', () => {
    it('should update tenant subscription plan', async () => {
      const tenantData = {
        name: 'Test Hospital Update',
        slug: 'test-hospital-update',
        email: 'admin@updatehospital.com',
        password: 'TestPassword123!',
        plan: 'basic' as const
      };

      const created = await tenantService.createTenant(tenantData);
      const tenantId = created.data.tenant.id;

      const result = await tenantService.updateTenantSubscription(tenantId, {
        plan: 'professional',
        status: 'active'
      });

      expect(result.success).toBe(true);
      expect(result.data.plan).toBe('professional');
      expect(result.data.status).toBe('active');
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const tenantData = {
        name: 'Test Hospital Stats',
        slug: 'test-hospital-stats',
        email: 'admin@statshospital.com',
        password: 'TestPassword123!',
        plan: 'professional' as const
      };

      const created = await tenantService.createTenant(tenantData);
      const tenantId = created.data.tenant.id;

      const result = await tenantService.getTenantStats(tenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.totalUsers).toBeDefined();
      expect(result.data.totalHospitals).toBeDefined();
      expect(result.data.totalServices).toBeDefined();
      expect(typeof result.data.totalUsers).toBe('number');
    });
  });

  describe('deactivateTenant', () => {
    it('should deactivate tenant successfully', async () => {
      const tenantData = {
        name: 'Test Hospital Deactivate',
        slug: 'test-hospital-deactivate',
        email: 'admin@deactivatehospital.com',
        password: 'TestPassword123!',
        plan: 'professional' as const
      };

      const created = await tenantService.createTenant(tenantData);
      const tenantId = created.data.tenant.id;

      const result = await tenantService.deactivateTenant(tenantId);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
    });
  });
});