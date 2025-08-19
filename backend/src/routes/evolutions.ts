import { Router } from 'express';
import { 
  createEvolution, 
  getEvolutions, 
  getEvolution, 
  updateEvolution, 
  deleteEvolution 
} from '@/controllers/evolutions';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.post('/', asyncHandler(createEvolution));
router.get('/', asyncHandler(getEvolutions));
router.get('/:id', asyncHandler(getEvolution));
router.put('/:id', asyncHandler(updateEvolution));
router.delete('/:id', asyncHandler(deleteEvolution));

export { router as evolutionRoutes };