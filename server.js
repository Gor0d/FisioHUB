const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: ['https://fisiohub.app', 'https://frontend-gj0k6rk3l-gor0ds-projects.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    message: 'FisioHUB API funcionando!',
    version: '1.0.0'
  });
});

// Basic API endpoints
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({
    error: 'Token de autenticação necessário'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@fisiohub.app' && password === 'admin123') {
    res.json({
      success: true,
      user: { id: 1, email: 'admin@fisiohub.app', name: 'Admin' },
      token: 'sample-jwt-token-for-testing'
    });
  } else {
    res.status(401).json({
      error: 'Credenciais inválidas'
    });
  }
});

app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'patient_1',
        name: 'João Silva',
        attendanceNumber: 'ATD-001',
        bedNumber: '101-A',
        admissionDate: '2025-08-25T10:00:00Z',
        isActive: true
      },
      {
        id: 'patient_2', 
        name: 'Maria Santos',
        attendanceNumber: 'ATD-002',
        bedNumber: '102-B',
        admissionDate: '2025-08-24T15:30:00Z',
        isActive: true
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FisioHUB API rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});