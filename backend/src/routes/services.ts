import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { tenantResolver } from '@/middleware/tenantResolver';
import {
  createService,
  listServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceStats
} from '@/controllers/servicesController';

const router = Router();

// Middleware para todas as rotas
router.use(tenantResolver);
router.use(authMiddleware);

// Rotas CRUD de Serviços
router.post('/', createService);
router.get('/', listServices);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

// Estatísticas do serviço
router.get('/:id/stats', getServiceStats);

export default router;