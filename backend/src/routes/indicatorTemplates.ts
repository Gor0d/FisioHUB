import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { tenantMiddleware, tenantIsolationMiddleware } from '@/middleware/tenant';
import {
  createTemplate,
  listTemplatesByService,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplates
} from '@/controllers/indicatorTemplatesController';

const router = Router();

// Rota pública para templates padrão
router.get('/defaults', getDefaultTemplates);

// Middleware para todas as outras rotas
router.use(tenantMiddleware);
router.use(authMiddleware);
router.use(tenantIsolationMiddleware);

// Rotas CRUD de Templates
router.post('/', createTemplate);
router.get('/', listTemplates);
router.get('/service/:serviceId', listTemplatesByService);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;