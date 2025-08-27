import { Router } from 'express';

const router = Router();

// Placeholder route - services will be properly implemented later
router.get('/health', (req, res) => {
  res.json({ status: 'Services API working', timestamp: new Date().toISOString() });
});

export default router;