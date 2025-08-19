import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getMrcScales,
  createMrcScale
} from '../controllers/mrcScaleController';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para escalas MRC
router.get('/', getMrcScales);
router.post('/', createMrcScale);

export default router;