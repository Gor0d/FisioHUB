import { Router } from 'express';
import {
  loginTenant,
  refreshAccessToken,
  logoutTenant,
  registerTenant,
  getTenantInfo,
  getCurrentUser,
  validateToken
} from '@/controllers/tenantAuth';
import { tenantResolver } from '@/middleware/tenantResolver';
import { tenantAuthMiddleware } from '@/middleware/tenantAuth';
import { tenantIsolation } from '@/middleware/tenantIsolation';

const router = Router();

// ================================
// ROTAS PÚBLICAS (sem autenticação)
// ================================

/**
 * POST /api/auth/login
 * Fazer login em um tenant específico
 */
router.post('/login', loginTenant);

/**
 * POST /api/auth/refresh
 * Renovar token de acesso
 */
router.post('/refresh', refreshAccessToken);

/**
 * POST /api/auth/validate
 * Validar token (útil para verificações rápidas)
 */
router.post('/validate', validateToken);

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

// ================================
// ROTAS PROTEGIDAS (requerem autenticação)
// ================================

// Aplicar middlewares de tenant e autenticação para rotas protegidas
router.use(tenantResolver);
router.use(tenantIsolation);
router.use(tenantAuthMiddleware);

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', getCurrentUser);

/**
 * POST /api/auth/logout
 * Fazer logout (informativo, cliente deve descartar tokens)
 */
router.post('/logout', logoutTenant);

export { router as tenantAuthRoutes };