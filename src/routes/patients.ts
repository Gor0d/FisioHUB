import { Router } from 'express';
import { 
  createPatient, 
  getPatients, 
  getPatient, 
  updatePatient, 
  deletePatient 
} from '@/controllers/patients';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.post('/', asyncHandler(createPatient));
router.get('/', asyncHandler(getPatients));
router.get('/:id', asyncHandler(getPatient));
router.put('/:id', asyncHandler(updatePatient));
router.delete('/:id', asyncHandler(deletePatient));

export { router as patientRoutes };