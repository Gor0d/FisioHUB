const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fisiohub.app',
    'https://fisiohubtech.com.br'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'desenvolvimento',
    message: 'Railway funcionando com index.js!'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando via index.js!', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/test', (req, res) => {
  res.json({ 
    message: 'POST funcionando via index.js!', 
    body: req.body, 
    timestamp: new Date().toISOString() 
  });
});

// Simple registration (no database for now)
app.post('/api/tenants/register', (req, res) => {
  try {
    console.log('Registration via index.js:', req.body);
    res.json({
      success: true,
      message: 'Registro funcionando via index.js - database em manutenção',
      data: { 
        test: true, 
        body: req.body, 
        timestamp: new Date().toISOString(),
        note: 'Database será reconectado em breve'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tenant info
app.get('/api/tenants/:slug/info', (req, res) => {
  res.json({
    success: true,
    message: 'Tenant info via index.js',
    data: { 
      slug: req.params.slug, 
      test: true,
      timestamp: new Date().toISOString() 
    }
  });
});

// Catch all
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada via index.js' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port} via index.js`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});