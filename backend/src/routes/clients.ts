import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import {
  createClient,
  listClients,
  getClientById,
  updateClient,
  getClientStats
} from '@/controllers/clientsController';

const router = Router();

// Middleware para todas as rotas (apenas admin)
router.use(authMiddleware);

// TODO: Adicionar middleware para verificar se usuário é super admin

// Rotas CRUD de Clientes
router.post('/', createClient);
router.get('/', listClients);
router.get('/:id', getClientById);
router.put('/:id', updateClient);

// Estatísticas do cliente
router.get('/:id/stats', getClientStats);

export default router;