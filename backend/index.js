const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Temporary in-memory storage for registered tenants
const registeredTenants = {};

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

// Simple registration (with memory storage)
app.post('/api/tenants/register', (req, res) => {
  try {
    console.log('Registration via index.js:', req.body);
    const { name, slug, email, password } = req.body;
    
    // Store tenant in memory
    registeredTenants[slug] = {
      id: `temp-${Date.now()}`,
      name,
      slug,
      email,
      status: 'trial',
      plan: 'professional',
      createdAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: { 
        tenant: registeredTenants[slug],
        admin: {
          email,
          name: `Admin ${name}`
        },
        note: 'Conta temporária - database será reconectado em breve'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tenant info - check registered tenants or availability
app.get('/api/tenants/:slug/info', (req, res) => {
  const slug = req.params.slug;
  
  // Check if tenant was registered (stored in memory)
  if (registeredTenants[slug]) {
    return res.json({
      success: true,
      message: 'Tenant encontrado',
      ...registeredTenants[slug]
    });
  }
  
  // Check reserved slugs
  const takenSlugs = ['admin', 'test', 'api', 'www', 'fisiohub', 'demo'];
  
  if (takenSlugs.includes(slug)) {
    return res.json({
      success: true,
      message: 'Slug já existe',
      data: { 
        slug: slug, 
        taken: true,
        timestamp: new Date().toISOString() 
      }
    });
  }
  
  // Most slugs should return 404 (available)
  return res.status(404).json({
    success: false,
    message: 'Tenant não encontrado (slug disponível)',
    code: 'NOT_FOUND'
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