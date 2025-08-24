import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { publicRoutes } from '@/routes/public';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Health check simples
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas públicas (registration)
app.use('/api', publicRoutes);

// Catch all
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});