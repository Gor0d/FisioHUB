import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerTenant, getTenantInfo } from '@/controllers/tenantAuth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware básico
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fisiohub.app',
    'https://fisiohubtech.com.br',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Health check simples
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'desenvolvimento'
  });
});

// Rotas essenciais apenas
app.post('/api/tenants/register', registerTenant);
app.get('/api/tenants/:slug/info', getTenantInfo);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

// Catch all
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
});