import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  createBarthelScale,
  createMrcScale,
  getBarthelScales,
  getMrcScales,
  getPatientImprovements,
  getDashboardImprovements
} from '@/controllers/scales';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para Escala de Barthel
router.post('/barthel', asyncHandler(createBarthelScale));
router.get('/barthel', asyncHandler(getBarthelScales));

// Rotas para Escala MRC
router.post('/mrc', asyncHandler(createMrcScale));
router.get('/mrc', asyncHandler(getMrcScales));

// Rotas para análise de melhorias
router.get('/improvements/patient/:patientId', asyncHandler(getPatientImprovements));
router.get('/improvements/dashboard', asyncHandler(getDashboardImprovements));

export { router as scalesRouter };