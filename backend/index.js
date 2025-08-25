const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma
const prisma = new PrismaClient();

// Temporary in-memory storage for registered tenants (fallback)
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

// Database diagnostic endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('=== DATABASE DIAGNOSTIC ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'undefined');
    
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query result:', result);
    
    // Test tenant count
    const tenantCount = await prisma.tenant.count();
    console.log('Total tenants in database:', tenantCount);
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connected: true,
        tenantCount,
        testQuery: result,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: {
        code: error.code,
        message: error.message,
        type: error.constructor.name
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/test', (req, res) => {
  res.json({ 
    message: 'POST funcionando via index.js!', 
    body: req.body, 
    timestamp: new Date().toISOString() 
  });
});

// Registration with real database
app.post('/api/tenants/register', async (req, res) => {
  try {
    console.log('Registration via index.js with database:', req.body);
    const { name, slug, email, password } = req.body;
    
    // Basic validation
    if (!name || !slug || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Try database first, fallback to memory
    try {
      // Check if slug is already taken in database
      const existingTenant = await prisma.tenant.findFirst({
        where: { slug }
      });
      
      if (existingTenant) {
        return res.status(409).json({
          success: false,
          message: 'Este identificador já está em uso',
          code: 'DUPLICATE_SLUG'
        });
      }
      
      // Create tenant in database
      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          email,
          status: 'trial',
          plan: 'professional',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });
      
      // Hash password and create admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = await prisma.globalUser.create({
        data: {
          email,
          name: `Admin ${name}`,
          password: hashedPassword,
          role: 'admin',
          tenantId: tenant.id
        }
      });
      
      console.log(`✅ Tenant criado no DB: ${tenant.name} (${tenant.slug})`);
      console.log(`✅ Admin criado no DB: ${adminUser.email}`);
      
      res.json({
        success: true,
        message: 'Conta criada com sucesso!',
        data: { 
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            plan: tenant.plan,
            createdAt: tenant.createdAt,
            trialEndsAt: tenant.trialEndsAt
          },
          admin: {
            email: adminUser.email,
            name: adminUser.name
          }
        }
      });
      
    } catch (dbError) {
      console.warn('Database error, using memory fallback:', dbError.message);
      
      // Fallback to memory storage
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
        message: 'Conta criada com sucesso! (modo temporário)',
        data: { 
          tenant: registeredTenants[slug],
          admin: {
            email,
            name: `Admin ${name}`
          },
          note: 'Dados salvos temporariamente - database será reconectado'
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tenant info - check database first, then memory, then availability
app.get('/api/tenants/:slug/info', async (req, res) => {
  const slug = req.params.slug;
  
  try {
    // Try database first
    try {
      const tenant = await prisma.tenant.findFirst({
        where: { slug }
      });
      
      if (tenant) {
        return res.json({
          success: true,
          message: 'Tenant encontrado',
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan,
          createdAt: tenant.createdAt,
          trialEndsAt: tenant.trialEndsAt
        });
      }
    } catch (dbError) {
      console.warn('Database error in tenant info:', dbError.message);
    }
    
    // Check if tenant was registered (stored in memory)
    if (registeredTenants[slug]) {
      return res.json({
        success: true,
        message: 'Tenant encontrado (temporário)',
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
    
  } catch (error) {
    console.error('Error in tenant info:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Catch all
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada via index.js' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port} via index.js`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});