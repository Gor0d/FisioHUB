import { Router } from 'express';
import { 
  createAppointment, 
  getAppointments, 
  getAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '@/controllers/appointments';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.post('/', asyncHandler(createAppointment));
router.get('/', asyncHandler(getAppointments));
router.get('/:id', asyncHandler(getAppointment));
router.put('/:id', asyncHandler(updateAppointment));
router.delete('/:id', asyncHandler(deleteAppointment));

export { router as appointmentRoutes };