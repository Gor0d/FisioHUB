import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { authRoutes } from '@/routes/auth';
import { patientRoutes } from '@/routes/patients';
import { appointmentRoutes } from '@/routes/appointments';
import { evolutionRoutes } from '@/routes/evolutions';
import { dashboardRoutes } from '@/routes/dashboard';
import indicatorsRoutes from '@/routes/indicators';
import barthelScalesRoutes from '@/routes/barthelScales';
import mrcScalesRoutes from '@/routes/mrcScales';
import { scalesRouter } from '@/routes/scales';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/evolutions', evolutionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/barthel-scales', barthelScalesRoutes);
app.use('/api/mrc-scales', mrcScalesRoutes);
app.use('/api/scales', scalesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});