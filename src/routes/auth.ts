import { Router } from 'express';
import { register, login, me } from '@/controllers/auth';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authenticateToken, asyncHandler(me));

export { router as authRoutes };