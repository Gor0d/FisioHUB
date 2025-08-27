const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = process.env.PORT || process.env.API_PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Default user ID for demo (in production this would come from authentication)
const DEFAULT_USER_ID = 'demo_user_001';

// Ensure default user exists
async function ensureDefaultUser() {
  try {
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: 'demo@fisiohub.app',
          name: 'Sistema Demo',
          password: 'demo_password',
          role: 'admin'
        }
      });
      console.log('✅ Usuário padrão criado:', user);
    }
  } catch (error) {
    console.log('ℹ️ Usuário padrão já existe ou erro:', error.message);
  }
}

// Initialize default user on startup
ensureDefaultUser();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'FisioHUB API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FisioHUB API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: 'GET /health',
      secure: 'GET /api/secure/:publicId/info'
    },
    message: 'API funcionando com sucesso!'
  });
});

// Mock secure endpoint for Hospital Galileu
app.get('/api/secure/:publicId/info', (req, res) => {
  const { publicId } = req.params;
  
  // Mock data for Hospital Galileu
  if (publicId === '0li0k7HNQslV') {
    return res.json({
      success: true,
      data: {
        id: 'tenant_galileu_2025',
        name: 'Hospital Galileu',
        publicId: '0li0k7HNQslV',
        slug: 'hospital-galileu',
        status: 'active',
        plan: 'professional',
        isActive: true,
        metadata: {
          specialty: 'fisioterapia_hospitalar',
          features: ['indicators', 'mrc_barthel', 'evolutions'],
          mock_data: true,
          created_by: 'claude_code'
        }
      }
    });
  }
  
  // Default not found
  res.status(404).json({
    success: false,
    message: 'Organização não encontrada'
  });
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build where clause
    const where = {};
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    const patients = await prisma.patient.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: patients,
      total: patients.length
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST endpoint for creating new patients
app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone, attendanceNumber, bedNumber, admissionDate, birthDate, address, diagnosis, observations } = req.body;
    
    // Validate required fields
    if (!name || !phone || !attendanceNumber || !admissionDate) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, phone, attendanceNumber, admissionDate'
      });
    }
    
    // Check if attendanceNumber already exists
    const existingPatient = await prisma.patient.findFirst({
      where: {
        attendanceNumber: attendanceNumber
      }
    });
    
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Número de atendimento já existe'
      });
    }
    
    // Create new patient in database
    const newPatient = await prisma.patient.create({
      data: {
        name,
        email: email || null,
        phone,
        attendanceNumber,
        bedNumber: bedNumber || null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        diagnosis: diagnosis || null,
        observations: observations || null,
        isActive: true,
        userId: DEFAULT_USER_ID // Required by schema
      }
    });
    
    console.log('📝 Novo paciente criado no banco:', newPatient);
    
    res.status(201).json({
      success: true,
      message: 'Paciente cadastrado com sucesso!',
      data: newPatient
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Dados duplicados encontrados'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Referência inválida - usuário não encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mock indicators endpoint
app.get('/api/dashboard/:tenantId', (req, res) => {
  res.json({
    success: true,
    data: {
      period: '30d',
      indicators: {},
      summary: {
        total: 0,
        onTarget: 0,
        improving: 0,
        deteriorating: 0,
        performance: 0
      }
    }
  });
});

// Generic not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('🏥 FisioHUB Simple API started successfully!');
  console.log(`📍 Server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log('✅ Ready for Railway deployment');
});

// Export for tests
module.exports = app;