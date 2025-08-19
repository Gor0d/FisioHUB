import { Router } from 'express';
import { 
  getDashboardStats,
  getUpcomingAppointments,
  getRecentEvolutions
} from '@/controllers/dashboard';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.get('/stats', asyncHandler(getDashboardStats));
router.get('/upcoming-appointments', asyncHandler(getUpcomingAppointments));
router.get('/recent-evolutions', asyncHandler(getRecentEvolutions));

export { router as dashboardRoutes };