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