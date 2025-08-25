import { Router, Request, Response } from 'express';
import {
  registerTenant,
  getTenantInfo
} from '@/controllers/tenantAuth';

const router = Router();

// ================================
// ROTAS PÚBLICAS (sem middleware de tenant)
// ================================

/**
 * Run database migrations manually
 */
router.get('/migrate', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    console.log('Running migrations...');
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    res.json({ 
      success: true, 
      message: 'Migrations executed successfully',
      stdout,
      stderr
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Migration failed', 
      error: error.message 
    });
  }
});

/**
 * Test basic endpoint
 */
router.get('/test-basic', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Basic endpoint working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Basic endpoint failed', 
      error: error.message 
    });
  }
});

/**
 * Debug database structure
 */
router.get('/debug-db', async (req, res) => {
  try {
    const { prisma } = require('@/lib/prisma');
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    res.json({
      success: true,
      message: 'Database structure',
      tables: tables
    });
    
  } catch (error: any) {
    console.error('Debug DB error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

/**
 * Test database connection and create test data if needed
 */
router.get('/test-db', async (req: Request, res: Response) => {
  try {
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcryptjs');
    
    let count = await prisma.tenant.count();
    let testTenant = null;
    let testUser = null;
    
    // If no tenants exist, create test data
    if (count === 0 && req.query.createTest === 'true') {
      const slug = 'hospital-teste-' + Date.now();
      const email = 'admin@teste.com';
      const password = 'teste123';
      
      // Create test tenant
      testTenant = await prisma.tenant.create({
        data: {
          name: 'Hospital Teste',
          slug: slug,
          email: email,
          status: 'trial',
          plan: 'basic',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      testUser = await prisma.globalUser.create({
        data: {
          email: email,
          name: 'Admin Hospital Teste',
          password: hashedPassword,
          role: 'admin',
          tenantId: testTenant.id
        }
      });
      
      count = 1;
    }
    
    return res.json({ 
      success: true, 
      message: 'Database connected', 
      tenantCount: count,
      env: process.env.NODE_ENV,
      testData: testTenant ? {
        tenant: {
          id: testTenant.id,
          name: testTenant.name,
          slug: testTenant.slug
        },
        admin: {
          email: testUser.email,
          password: 'teste123',
          tenantSlug: testTenant.slug
        }
      } : null
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

/**
 * POST /api/tenants/register
 * Cadastrar novo tenant (público)
 */
router.post('/tenants/register', registerTenant);

/**
 * GET /api/tenants/:slug/info  
 * Obter informações públicas de um tenant
 */
router.get('/tenants/:slug/info', getTenantInfo);

/**
 * POST /api/create-test-tenant
 * Create a complete test tenant with admin user for testing
 */
router.post('/create-test-tenant', async (req, res) => {
  try {
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcryptjs');
    
    const { name = 'Clinica Teste', slug = 'clinica-teste', email = 'admin@teste.com', password = 'teste123' } = req.body;
    
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug: slug + '-' + Date.now(), // Make unique
        email,
        status: 'trial',
        plan: 'basic',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const adminUser = await prisma.globalUser.create({
      data: {
        email,
        name: 'Admin ' + name,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant.id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Test tenant created successfully',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        },
        credentials: {
          email,
          password, // Return plain password for testing
          tenantSlug: tenant.slug
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error creating test tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test tenant',
      error: error.message
    });
  }
});

/**
 * POST /api/test-login
 * Simplified login for testing with current schema
 */
router.post('/test-login', async (req, res) => {
  try {
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const { email, password, tenantSlug } = req.body;
    
    if (!email || !password || !tenantSlug) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and tenantSlug are required'
      });
    }
    
    // Find tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: tenantSlug },
          { subdomain: tenantSlug }
        ],
        status: { in: ['trial', 'active'] }
      }
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive'
      });
    }
    
    // Find user
    const user = await prisma.globalUser.findFirst({
      where: {
        email: email,
        tenantId: tenant.id,
        isActive: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate simple JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: user.role
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan
        }
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * Test deployment endpoint
 */
router.get('/deployment-test', async (req, res) => {
  res.json({
    success: true,
    message: 'Deployment test successful - auth system updated',
    timestamp: new Date().toISOString(),
    version: '2.0-auth-fixed'
  });
});

export { router as publicRoutes };