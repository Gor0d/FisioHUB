import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// Rotas de teste simples (sem banco) - mudei a rota para testar
app.post('/api/register-test', (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    res.json({
      success: true,
      message: 'Teste funcionando - banco desabilitado temporariamente',
      data: { test: true, body: req.body }
    });
  } catch (error) {
    console.error('Error in test registration:', error);
    res.status(500).json({ success: false, message: 'Test error: ' + error.message });
  }
});

app.get('/api/info-test/:slug', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Teste funcionando - banco desabilitado temporariamente',
      data: { slug: req.params.slug, test: true }
    });
  } catch (error) {
    console.error('Error in test tenant info:', error);
    res.status(500).json({ success: false, message: 'Test error: ' + error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

app.post('/api/test', (req, res) => {
  res.json({ message: 'POST funcionando!', body: req.body, timestamp: new Date().toISOString() });
});

// Alternative registration endpoint  
app.post('/api/signup', (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    res.json({
      success: true,
      message: 'Signup endpoint funcionando!',
      data: { test: true, body: req.body, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ success: false, message: 'Signup error: ' + error.message });
  }
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