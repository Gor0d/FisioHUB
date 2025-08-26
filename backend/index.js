// Load environment variables
require('dotenv').config();

// Override DATABASE_URL if running on Railway
if (process.env.PORT === '8080' || process.env.RAILWAY_ENVIRONMENT) {
  // Use Railway external URL (internal network seems not accessible)
  process.env.DATABASE_URL = "postgresql://postgres:UvSaOMuJOsmBOvfByQrljtFYCbhTZJhW@tramway.proxy.rlwy.net:53549/railway";
  process.env.NODE_ENV = "production";
  console.log('🚂 Railway detected - using Railway external DATABASE_URL');
} else {
  console.log('💻 Local environment detected');
}

console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'undefined');

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma
console.log('🔄 Initializing Prisma Client with DATABASE_URL...');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Test Prisma connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma Client connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma Client connection failed:', error);
  });

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'FisioHub API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      register: 'POST /api/tenants/register',
      tenantInfo: 'GET /api/tenants/:slug/info',
      dbTest: '/api/db-test',
      migrate: 'POST /api/migrate'
    },
    timestamp: new Date().toISOString(),
    message: 'API funcionando com sucesso!'
  });
});

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

// Environment debug endpoint
app.get('/api/debug-env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 30) + '...[REDACTED]' : 'undefined',
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

// Force Prisma regeneration endpoint
app.post('/api/regenerate-prisma', async (req, res) => {
  try {
    console.log('🔄 Regenerating Prisma Client...');
    
    // Recreate Prisma client with current DATABASE_URL
    const newPrisma = new PrismaClient();
    
    // Test the connection
    await newPrisma.$connect();
    console.log('✅ New Prisma Client connected successfully');
    
    // Test a simple operation
    const testResult = await newPrisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma Client test query successful:', testResult);
    
    await newPrisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Prisma Client regenerated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error regenerating Prisma:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate Prisma Client',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
    
    // Check if tables exist
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'global_users', 'tenant', 'globalUser')
    `;
    console.log('Tables found:', tableCheck);
    
    let tenantCount = 'N/A';
    let globalUserCount = 'N/A';
    
    try {
      tenantCount = await prisma.tenant.count();
      console.log('Total tenants in database:', tenantCount);
    } catch (e) {
      console.log('Error counting tenants:', e.message);
    }
    
    try {
      globalUserCount = await prisma.globalUser.count();
      console.log('Total globalUsers in database:', globalUserCount);
    } catch (e) {
      console.log('Error counting globalUsers:', e.message);
    }
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connected: true,
        tablesFound: tableCheck,
        tenantCount,
        globalUserCount,
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

// Migration endpoint to create tables manually
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🚀 Starting manual migration...');
    
    // Drop existing incorrect tables first
    console.log('🗑️ Dropping incorrect tables...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "globalUser" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS tenant CASCADE`;
    console.log('✅ Old tables dropped');
    
    // Create tenants table (correct name - plural)
    console.log('📊 Creating tenants table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'trial',
        plan VARCHAR(50) DEFAULT 'basic',
        "subdomain" VARCHAR(255),
        "customDomain" VARCHAR(255),
        "logoUrl" VARCHAR(255),
        "billingEmail" VARCHAR(255),
        "trialEndsAt" TIMESTAMP,
        "isActive" BOOLEAN DEFAULT true,
        "lastActivityAt" TIMESTAMP DEFAULT NOW(),
        "metadata" JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tenants table created');
    
    // Create global_users table (correct name - snake_case + plural)
    console.log('📊 Creating global_users table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS global_users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        "isActive" BOOLEAN DEFAULT true,
        "tenantId" VARCHAR(255) NOT NULL,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ GlobalUser table created');
    
    // Create users table
    console.log('📊 Creating users table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        crf VARCHAR(255),
        phone VARCHAR(255),
        specialty VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created');
    
    // Create patients table
    console.log('📊 Creating patients table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255),
        cpf VARCHAR(255),
        "birthDate" TIMESTAMP,
        address TEXT,
        diagnosis TEXT,
        observations TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "userId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Patients table created');
    
    // Verify tables were created
    const tablesCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'global_users', 'users', 'patients')
    `;
    console.log('✅ Tables verification:', tablesCheck);
    
    res.json({
      success: true,
      message: 'Migration completed successfully!',
      data: {
        tablesCreated: tablesCheck,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('🚨 MIGRATION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
      console.log('🔍 Attempting database operations...');
      
      // Check if slug is already taken in database
      console.log('🔍 Checking existing tenant for slug:', slug);
      const existingTenant = await prisma.tenant.findFirst({
        where: { slug }
      });
      console.log('🔍 Existing tenant check result:', existingTenant ? 'FOUND' : 'NOT_FOUND');
      
      if (existingTenant) {
        return res.status(409).json({
          success: false,
          message: 'Este identificador já está em uso',
          code: 'DUPLICATE_SLUG'
        });
      }
      
      // Create tenant in database
      console.log('🔍 Creating tenant in database...');
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tenant = await prisma.tenant.create({
        data: {
          id: tenantId,
          name,
          slug,
          email,
          status: 'trial',
          plan: 'professional',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });
      console.log('✅ Tenant created:', tenant.id);
      
      // Hash password and create admin user
      console.log('🔍 Creating admin user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const adminUser = await prisma.globalUser.create({
        data: {
          id: userId,
          email,
          name: `Admin ${name}`,
          password: hashedPassword,
          role: 'admin',
          tenantId: tenant.id
        }
      });
      console.log('✅ Admin user created:', adminUser.id);
      
      console.log(`✅ SUCCESS: Tenant criado no DB: ${tenant.name} (${tenant.slug})`);
      console.log(`✅ SUCCESS: Admin criado no DB: ${adminUser.email}`);
      
      res.json({
        success: true,
        message: 'Conta criada com sucesso! (DATABASE)',
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
      console.error('🚨 DATABASE ERROR DETAILS:');
      console.error('Error type:', dbError.constructor.name);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      console.error('Error stack:', dbError.stack);
      console.error('DATABASE_URL being used:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + '...' : 'undefined');
      console.warn('🔄 Using memory fallback due to error above');
      
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

// Simple endpoint to create missing tables
app.post('/api/create-tables', async (req, res) => {
  try {
    console.log('🔧 Creating users table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        crf VARCHAR(255),
        phone VARCHAR(255),
        specialty VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('🔧 Creating patients table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255),
        cpf VARCHAR(255),
        "birthDate" TIMESTAMP,
        address TEXT,
        diagnosis TEXT,
        observations TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "userId" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    res.json({ 
      success: true, 
      message: 'Tables created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create tables',
      error: error.message
    });
  }
});

// Patients endpoints - BEFORE catch-all
app.get('/api/patients', async (req, res) => {
  try {
    console.log('📋 Fetching patients...');
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      message: 'Pacientes carregados com sucesso',
      data: {
        data: patients,
        total: patients.length
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar pacientes',
      error: error.message
    });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    console.log('👤 Creating patient:', req.body);
    const patientData = req.body;
    
    // Ensure we have a default user - create if doesn't exist
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@fisiohub.app' }
    });
    
    if (!defaultUser) {
      console.log('🔧 Creating default user...');
      defaultUser = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: 'admin@fisiohub.app',
          name: 'Sistema Padrão',
          password: 'temp_hash', // placeholder
          role: 'admin'
        }
      });
      console.log('✅ Default user created:', defaultUser.id);
    }
    
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: defaultUser.id // Associate with default user
      }
    });
    
    console.log('✅ Patient created:', patient.id);
    
    res.json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar paciente',
      error: error.message
    });
  }
});

// Catch all - MUST be last
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada via index.js' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port} via index.js`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});