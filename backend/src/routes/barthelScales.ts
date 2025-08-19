import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getBarthelScales,
  createBarthelScale
} from '../controllers/barthelScaleController';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para escalas de Barthel
router.get('/', getBarthelScales);
router.post('/', createBarthelScale);

export default router;