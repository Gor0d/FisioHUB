import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getIndicators,
  createIndicator,
  getIndicatorById,
  getIndicatorStats
} from '../controllers/indicatorsController';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para indicadores
router.get('/', getIndicators);
router.post('/', createIndicator);
router.get('/stats', getIndicatorStats);
router.get('/:id', getIndicatorById);

export default router;