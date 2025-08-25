import { Router } from 'express';
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
 * Test database connection
 */
router.get('/test-db', async (req, res) => {
  try {
    const { prisma } = require('@/lib/prisma');
    const count = await prisma.tenant.count();
    res.json({ 
      success: true, 
      message: 'Database connected', 
      tenantCount: count,
      env: process.env.NODE_ENV 
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    res.status(500).json({ 
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

export { router as publicRoutes };