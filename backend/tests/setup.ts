import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database connection
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup and close connection
  await prisma.$disconnect();
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  prisma,
  
  // Helper to create test tenant
  createTestTenant: async () => {
    return await prisma.tenant.create({
      data: {
        name: 'Test Hospital',
        slug: 'test-hospital-' + Date.now(),
        email: 'test@hospital.com',
        subscription: {
          create: {
            plan: 'professional',
            status: 'active',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          }
        }
      }
    });
  },

  // Helper to create test user
  createTestUser: async (tenantId: string) => {
    return await prisma.globalUser.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        tenantUsers: {
          create: {
            tenantId,
            name: 'Test User',
            role: 'COLLABORATOR'
          }
        }
      }
    });
  },

  // Cleanup helper
  cleanup: async () => {
    // Delete test data in correct order
    await prisma.tenantUser.deleteMany({
      where: { tenant: { slug: { startsWith: 'test-' } } }
    });
    await prisma.globalUser.deleteMany({
      where: { email: { startsWith: 'test' } }
    });
    await prisma.tenantSubscription.deleteMany({
      where: { tenant: { slug: { startsWith: 'test-' } } }
    });
    await prisma.tenant.deleteMany({
      where: { slug: { startsWith: 'test-' } }
    });
  }
};