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
const SlugSecurity = require('./utils/slug-security');
const rateLimiters = require('./middleware/rate-limiting');
const { securityHeaders, secureCorsOptions } = require('./middleware/security-headers');
const InputValidator = require('./middleware/input-validation');
const emailVerificationService = require('./services/email-verification');
const { IndicatorsController } = require('./controllers/indicators');
const { AssessmentsController } = require('./controllers/assessments');
const { EvolutionsController } = require('./controllers/evolutions');

const app = express();
const port = process.env.API_PORT || process.env.PORT || 3001;

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

// Security Middleware (must be first)
app.use(securityHeaders());

// CORS with security
app.use(cors(secureCorsOptions));

// Rate limiting for all requests
app.use(rateLimiters.public);

// Body parsing with size limits
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    // Check for malformed JSON
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('JSON malformado');
    }
  }
}));

// Input validation for all requests
app.use(InputValidator.validateInput);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'FisioHub API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      register: 'POST /api/tenants/register',
      emailVerify: 'POST /api/email/verify',
      emailResend: 'POST /api/email/resend',
      indicators: 'GET/POST /api/indicators',
      dashboard: 'GET /api/dashboard/:tenantId',
      tenantInfo: 'GET /api/tenants/:slug/info',
      secureAccess: 'GET /api/secure/:publicId/info',
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
        "publicId" VARCHAR(255) UNIQUE NOT NULL,
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

// Step 1: Registration - Send email verification
app.post('/api/tenants/register', 
  rateLimiters.register,
  InputValidator.validateRegistration,
  async (req, res) => {
  try {
    console.log('🔄 Iniciando registro com verificação de email:', req.body);
    const { name, slug, email, password } = req.body;
    
    // Basic validation
    if (!name || !slug || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Step 1: Check if slug/email already exists
    try {
      console.log('🔍 Verificando disponibilidade...');
      
      // Check if slug is already taken
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

      // Check if email is already registered
      const existingEmail = await prisma.globalUser.findFirst({
        where: { email }
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Este email já possui uma conta',
          code: 'DUPLICATE_EMAIL'
        });
      }

      // Step 2: Send verification email
      console.log('📧 Enviando código de verificação...');
      const verificationResult = await emailVerificationService.sendVerificationCode(email, name);

      if (verificationResult.success) {
        // Store registration data temporarily (for completion after verification)
        const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // In production, store this in Redis or database
        global.pendingRegistrations = global.pendingRegistrations || new Map();
        global.pendingRegistrations.set(registrationId, {
          name,
          slug,
          email,
          password, // Will be hashed when account is created
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
        });

        return res.json({
          success: true,
          message: 'Código de verificação enviado para seu email',
          data: {
            registrationId,
            verificationId: verificationResult.verificationId,
            expiresAt: verificationResult.expiresAt,
            email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially hide email
            nextStep: 'EMAIL_VERIFICATION'
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar email de verificação',
          code: 'EMAIL_SEND_FAILED'
        });
      }
    
    } catch (dbError) {
      console.error('🚨 Erro no banco de dados:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Step 2: Verify email and complete registration
app.post('/api/email/verify',
  rateLimiters.auth,
  async (req, res) => {
    try {
      const { verificationId, code, registrationId } = req.body;

      if (!verificationId || !code || !registrationId) {
        return res.status(400).json({
          success: false,
          message: 'Dados de verificação incompletos'
        });
      }

      // Verify the email code
      const verificationResult = await emailVerificationService.verifyCode(verificationId, code);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        });
      }

      // Get pending registration data
      global.pendingRegistrations = global.pendingRegistrations || new Map();
      const registrationData = global.pendingRegistrations.get(registrationId);

      if (!registrationData) {
        return res.status(400).json({
          success: false,
          message: 'Dados de registro não encontrados ou expirados'
        });
      }

      // Check if registration expired
      if (Date.now() > registrationData.expiresAt) {
        global.pendingRegistrations.delete(registrationId);
        return res.status(400).json({
          success: false,
          message: 'Registro expirou. Inicie o processo novamente.'
        });
      }

      // Verify email matches
      if (registrationData.email !== verificationResult.email) {
        return res.status(400).json({
          success: false,
          message: 'Email de verificação não confere'
        });
      }

      // Email verified! Now create the tenant and user
      console.log('✅ Email verificado! Criando conta...');

      try {
        // Create tenant in database
        const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const publicId = SlugSecurity.generatePublicId(registrationData.slug);
        
        const tenant = await prisma.tenant.create({
          data: {
            id: tenantId,
            name: registrationData.name,
            slug: registrationData.slug,
            publicId,
            email: registrationData.email,
            status: 'trial',
            plan: 'professional',
            isActive: true,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
          }
        });

        // Create admin user
        const hashedPassword = await bcrypt.hash(registrationData.password, 12);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const adminUser = await prisma.globalUser.create({
          data: {
            id: userId,
            email: registrationData.email,
            name: `Admin ${registrationData.name}`,
            password: hashedPassword,
            role: 'admin',
            tenantId: tenant.id,
            isActive: true
          }
        });

        // Clean up temporary data
        global.pendingRegistrations.delete(registrationId);

        console.log(`🎉 Conta criada com sucesso: ${tenant.name} (${publicId})`);

        // Return success with tenant data
        res.json({
          success: true,
          message: 'Conta criada com sucesso!',
          data: {
            tenant: {
              id: tenant.id,
              name: tenant.name,
              publicId: tenant.publicId,
              email: tenant.email,
              status: tenant.status,
              plan: tenant.plan,
              trialEndsAt: tenant.trialEndsAt,
              createdAt: tenant.createdAt
            },
            admin: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role
            },
            urls: {
              dashboard: `https://fisiohub.app/t/${publicId}/dashboard`,
              patients: `https://fisiohub.app/t/${publicId}/patients`,
              login: `https://fisiohub.app/login?tenant=${publicId}`
            }
          }
        });

      } catch (dbError) {
        console.error('❌ Erro ao criar conta:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar conta no banco de dados'
        });
      }

    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

// Resend verification code
app.post('/api/email/resend',
  rateLimiters.auth,
  async (req, res) => {
    try {
      const { verificationId } = req.body;

      if (!verificationId) {
        return res.status(400).json({
          success: false,
          message: 'ID de verificação é obrigatório'
        });
      }

      const result = await emailVerificationService.resendCode(verificationId);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          expiresAt: result.expiresAt
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      console.error('❌ Erro ao reenviar código:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

// Indicators endpoints
app.post('/api/indicators',
  rateLimiters.api,
  IndicatorsController.recordIndicator
);

app.get('/api/dashboard/:tenantId',
  rateLimiters.api,
  IndicatorsController.getDashboard
);

app.get('/api/indicators/trends/:tenantId/:type',
  rateLimiters.api,
  IndicatorsController.getIndicatorTrends
);

app.get('/api/indicators/types',
  rateLimiters.api,
  IndicatorsController.getIndicatorTypes
);

// Assessments endpoints
app.post('/api/assessments',
  rateLimiters.api,
  AssessmentsController.createAssessment
);

app.get('/api/assessments/patient/:tenantId/:patientId',
  rateLimiters.api,
  AssessmentsController.getPatientAssessments
);

app.get('/api/assessments/trends/:tenantId/:patientId/:scaleType',
  rateLimiters.api,
  AssessmentsController.getAssessmentTrends
);

app.get('/api/assessments/:id',
  rateLimiters.api,
  AssessmentsController.getAssessment
);

app.get('/api/assessments/stats/:tenantId',
  rateLimiters.api,
  AssessmentsController.getAssessmentStats
);

app.get('/api/assessments/scales/config',
  rateLimiters.api,
  AssessmentsController.getScaleConfigs
);

// Evolutions endpoints
app.post('/api/evolutions',
  rateLimiters.api,
  EvolutionsController.createEvolution
);

app.get('/api/evolutions/patient/:tenantId/:patientId',
  rateLimiters.api,
  EvolutionsController.getPatientEvolutions
);

app.get('/api/evolutions/tenant/:tenantId',
  rateLimiters.api,
  EvolutionsController.getTenantEvolutions
);

app.get('/api/evolutions/stats/:tenantId',
  rateLimiters.api,
  EvolutionsController.getEvolutionStats
);

app.get('/api/evolutions/templates',
  rateLimiters.api,
  EvolutionsController.getEvolutionTemplates
);

app.get('/api/evolutions/:id',
  rateLimiters.api,
  EvolutionsController.getEvolution
);

app.put('/api/evolutions/:id',
  rateLimiters.api,
  EvolutionsController.updateEvolution
);

app.delete('/api/evolutions/:id',
  rateLimiters.api,
  EvolutionsController.deleteEvolution
);

// Secure tenant access by publicId
app.get('/api/secure/:publicId/info', async (req, res) => {
  const publicId = req.params.publicId;
  
  try {
    // Validate public ID format
    if (!SlugSecurity.isValidPublicId(publicId)) {
      return res.status(400).json({
        success: false,
        message: 'ID público inválido'
      });
    }

    // Try to find tenant by publicId
    try {
      const tenant = await prisma.tenant.findFirst({
        where: { publicId }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Organização não encontrada'
        });
      }

      // Check if tenant is active
      if (!tenant.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Organização inativa'
        });
      }

      res.json({
        success: true,
        data: {
          id: tenant.id,
          name: tenant.name,
          publicId: tenant.publicId,
          status: tenant.status,
          plan: tenant.plan,
          isActive: tenant.isActive,
          // Don't expose the real slug for security
          metadata: tenant.metadata
        }
      });

    } catch (dbError) {
      console.error('Database error in secure access:', dbError);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
    
  } catch (error) {
    console.error('Error in secure access:', error);
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

// Update tables with new schema
app.get('/api/update-tables', async (req, res) => {
  try {
    console.log('🔄 Updating table schema...');
    
    // Add new columns to existing patients table
    try {
      console.log('➕ Adding admissionDate column...');
      await prisma.$executeRaw`
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS "admissionDate" TIMESTAMP
      `;
    } catch (e) {
      console.log('admissionDate column may already exist');
    }
    
    try {
      console.log('➕ Adding dischargeDate column...');
      await prisma.$executeRaw`
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS "dischargeDate" TIMESTAMP
      `;
    } catch (e) {
      console.log('dischargeDate column may already exist');
    }
    
    try {
      console.log('➕ Adding dischargeReason column...');
      await prisma.$executeRaw`
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS "dischargeReason" TEXT
      `;
    } catch (e) {
      console.log('dischargeReason column may already exist');
    }
    
    try {
      console.log('➕ Adding attendanceNumber column...');
      await prisma.$executeRaw`
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS "attendanceNumber" VARCHAR(255)
      `;
    } catch (e) {
      console.log('attendanceNumber column may already exist');
    }
    
    try {
      console.log('➕ Adding bedNumber column...');
      await prisma.$executeRaw`
        ALTER TABLE patients ADD COLUMN IF NOT EXISTS "bedNumber" VARCHAR(255)
      `;
    } catch (e) {
      console.log('bedNumber column may already exist');
    }
    
    // Create bed_transfers table
    try {
      console.log('📊 Creating bed_transfers table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS bed_transfers (
          id VARCHAR(255) PRIMARY KEY,
          "patientId" VARCHAR(255) NOT NULL,
          "fromBed" VARCHAR(255),
          "toBed" VARCHAR(255) NOT NULL,
          "transferDate" TIMESTAMP DEFAULT NOW(),
          reason TEXT,
          notes TEXT,
          "userId" VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
    } catch (e) {
      console.log('bed_transfers table may already exist');
    }
    
    res.json({
      success: true,
      message: 'Schema updated successfully!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating schema:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schema',
      error: error.message
    });
  }
});

// EMERGENCY: Direct SQL table creation
app.get('/api/force-create-tables', async (req, res) => {
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
    
    // Auto-create tables if they don't exist
    try {
      console.log('🔧 Ensuring tables exist...');
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
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(255),
          "attendanceNumber" VARCHAR(255),
          "bedNumber" VARCHAR(255),
          "admissionDate" TIMESTAMP,
          "birthDate" TIMESTAMP,
          address TEXT,
          diagnosis TEXT,
          observations TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "dischargeDate" TIMESTAMP,
          "dischargeReason" TEXT,
          "userId" VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
      console.log('✅ Tables ensured');
    } catch (createError) {
      console.log('Table creation skipped (may already exist):', createError.message);
    }
    
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

// Update patient endpoint
app.patch('/api/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;
    
    console.log(`✏️ Updating patient ${patientId}:`, updateData);
    
    // Get current patient to verify it exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }
    
    // Update patient with new data
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: updateData
    });
    
    console.log('✅ Patient updated successfully:', updatedPatient.id);
    
    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: updatedPatient
    });
    
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar paciente',
      error: error.message
    });
  }
});

// Patient bed transfer endpoint
app.post('/api/patients/:patientId/transfer', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { fromBed, toBed, reason, notes } = req.body;
    
    console.log(`🏥 Transferring patient ${patientId} from ${fromBed} to ${toBed}`);
    
    // Ensure we have a default user
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
          password: 'temp_hash',
          role: 'admin'
        }
      });
    }
    
    // Tables are managed by Prisma schema
    
    // Get current patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }
    
    // Create bed transfer record using Prisma ORM
    const transfer = await prisma.bedTransfer.create({
      data: {
        id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: patientId,
        fromBed: fromBed,
        toBed: toBed,
        reason: reason,
        notes: notes,
        userId: defaultUser.id,
        transferDate: new Date()
      }
    });
    
    // Update patient's current bed
    await prisma.patient.update({
      where: { id: patientId },
      data: { bedNumber: toBed }
    });
    
    console.log('✅ Patient transferred successfully');
    
    res.json({
      success: true,
      message: 'Transferência registrada com sucesso',
      data: {
        patientId,
        fromBed,
        toBed,
        reason,
        transferDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error transferring patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao transferir paciente',
      error: error.message
    });
  }
});

// Get patient transfer history
app.get('/api/patients/:patientId/transfers', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log(`📋 Fetching transfer history for patient ${patientId}`);
    
    // Get patient to verify it exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }
    
    // Create bed_transfers table if not exists (safety check)
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS bed_transfers (
          id VARCHAR(255) PRIMARY KEY,
          "patientId" VARCHAR(255) NOT NULL,
          "fromBed" VARCHAR(255),
          "toBed" VARCHAR(255) NOT NULL,
          "transferDate" TIMESTAMP DEFAULT NOW(),
          reason TEXT,
          notes TEXT,
          "userId" VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY ("patientId") REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        )
      `;
    } catch (createError) {
      console.log('BedTransfer table creation skipped (may already exist)');
    }
    
    // Get transfer history using raw SQL for compatibility
    const transfers = await prisma.$queryRaw`
      SELECT 
        id,
        "patientId",
        "fromBed",
        "toBed", 
        "transferDate",
        reason,
        notes,
        "createdAt"
      FROM bed_transfers 
      WHERE "patientId" = ${patientId}
      ORDER BY "transferDate" DESC
    `;
    
    console.log(`✅ Found ${transfers.length} transfers for patient ${patientId}`);
    
    res.json({
      success: true,
      message: 'Histórico de transferências carregado com sucesso',
      data: {
        patientId,
        patientName: patient.name,
        transfers: transfers || [],
        total: transfers.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar histórico de transferências',
      error: error.message
    });
  }
});

// Patient discharge endpoint
app.post('/api/patients/:patientId/discharge', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { dischargeDate, dischargeReason, notes } = req.body;
    
    console.log(`🏥 Discharging patient ${patientId}`);
    
    // Get current patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }
    
    // Update patient with discharge information
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        isActive: false,
        dischargeDate: new Date(dischargeDate),
        dischargeReason: dischargeReason
      }
    });
    
    console.log('✅ Patient discharged successfully');
    
    res.json({
      success: true,
      message: 'Alta registrada com sucesso',
      data: {
        patientId,
        dischargeDate,
        dischargeReason,
        notes
      }
    });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao dar alta ao paciente',
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