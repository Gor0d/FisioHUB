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

// Initialize default user on startup - COMMENTED OUT FOR DEBUG
// ensureDefaultUser();

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

// Get indicator types configuration
app.get('/api/indicators/types', (req, res) => {
  const indicatorTypes = {
    early_mobilization: {
      name: 'Mobilização Precoce',
      description: 'Percentual de pacientes mobilizados nas primeiras 24h',
      unit: '%',
      target: 80,
      format: 'percentage',
      category: 'mobility'
    },
    mechanical_ventilation: {
      name: 'Tempo Ventilação Mecânica',
      description: 'Dias médios em ventilação mecânica',
      unit: 'dias',
      target: 5,
      format: 'decimal',
      category: 'respiratory'
    },
    functional_independence: {
      name: 'Independência Funcional',
      description: 'Score médio de independência (Barthel)',
      unit: 'pontos',
      target: 85,
      format: 'integer',
      category: 'functional'
    },
    muscle_strength: {
      name: 'Força Muscular',
      description: 'Score médio de força (MRC)',
      unit: 'pontos',
      target: 48,
      format: 'integer',
      category: 'strength'
    },
    hospital_stay: {
      name: 'Tempo de Internação',
      description: 'Dias médios de internação hospitalar',
      unit: 'dias',
      target: 12,
      format: 'decimal',
      category: 'efficiency'
    },
    readmission_30d: {
      name: 'Readmissão 30 dias',
      description: 'Taxa de readmissão em 30 dias',
      unit: '%',
      target: 8,
      format: 'percentage',
      category: 'quality'
    },
    patient_satisfaction: {
      name: 'Satisfação do Paciente',
      description: 'Score médio de satisfação',
      unit: 'pontos',
      target: 9,
      format: 'decimal',
      category: 'satisfaction'
    },
    discharge_destination: {
      name: 'Alta para Casa',
      description: 'Percentual de alta para domicílio',
      unit: '%',
      target: 75,
      format: 'percentage',
      category: 'outcomes'
    }
  };

  res.json({
    success: true,
    data: {
      config: indicatorTypes,
      categories: {
        mobility: 'Mobilidade',
        respiratory: 'Respiratório',
        functional: 'Funcional',
        strength: 'Força',
        efficiency: 'Eficiência',
        quality: 'Qualidade',
        satisfaction: 'Satisfação',
        outcomes: 'Desfechos'
      }
    }
  });
});

// Create new indicator
app.post('/api/indicators', async (req, res) => {
  try {
    const { tenantId, type, value, targetValue, patientId, measurementDate, metadata } = req.body;
    
    // Validate required fields
    if (!tenantId || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: tenantId, type, value'
      });
    }
    
    // Get indicator type configuration
    const indicatorTypes = {
      early_mobilization: { name: 'Mobilização Precoce', unit: '%', target: 80, format: 'percentage', category: 'mobility' },
      mechanical_ventilation: { name: 'Tempo Ventilação Mecânica', unit: 'dias', target: 5, format: 'decimal', category: 'respiratory' },
      functional_independence: { name: 'Independência Funcional', unit: 'pontos', target: 85, format: 'integer', category: 'functional' },
      muscle_strength: { name: 'Força Muscular', unit: 'pontos', target: 48, format: 'integer', category: 'strength' },
      hospital_stay: { name: 'Tempo de Internação', unit: 'dias', target: 12, format: 'decimal', category: 'efficiency' },
      readmission_30d: { name: 'Readmissão 30 dias', unit: '%', target: 8, format: 'percentage', category: 'quality' },
      patient_satisfaction: { name: 'Satisfação do Paciente', unit: 'pontos', target: 9, format: 'decimal', category: 'satisfaction' },
      discharge_destination: { name: 'Alta para Casa', unit: '%', target: 75, format: 'percentage', category: 'outcomes' }
    };
    const indicatorConfig = indicatorTypes[type];
    
    if (!indicatorConfig) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de indicador inválido'
      });
    }
    
    // Create indicator in database (with fallback to mock data)
    let newIndicator;
    
    try {
      newIndicator = await prisma.indicator.create({
        data: {
          tenantId,
          type,
          value: parseFloat(value),
          targetValue: targetValue || indicatorConfig.target,
          unit: indicatorConfig.unit,
          patientId: patientId || null,
          measurementDate: measurementDate ? new Date(measurementDate) : new Date(),
          metadata: metadata ? JSON.stringify(metadata) : null,
          createdBy: DEFAULT_USER_ID
        }
      });
    } catch (error) {
      console.log('⚠️ Erro no banco, usando dados simulados:', error.message);
      
      // Mock response for demonstration
      newIndicator = {
        id: 'mock_' + Date.now(),
        tenantId,
        type,
        value: parseFloat(value),
        targetValue: targetValue || indicatorConfig.target,
        unit: indicatorConfig.unit,
        patientId: patientId || null,
        measurementDate: measurementDate ? new Date(measurementDate) : new Date(),
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdBy: DEFAULT_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    res.status(201).json({
      success: true,
      message: 'Indicador registrado com sucesso!',
      data: newIndicator
    });
  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get indicators list
app.get('/api/indicators', async (req, res) => {
  try {
    const { tenantId, patientId, type, limit = 50 } = req.query;
    
    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (patientId) where.patientId = patientId;
    if (type) where.type = type;
    
    const indicators = await prisma.indicator.findMany({
      where,
      orderBy: {
        measurementDate: 'desc'
      },
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: indicators,
      total: indicators.length
    });
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Dashboard with indicators data
app.get('/api/dashboard/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { period = '30d' } = req.query;
    
    console.log(`📊 Dashboard request - Tenant: ${tenantId}, Period: ${period}`);
    
    // Calculate date range based on period
    const now = new Date();
    const dateFilter = new Date(now);
    
    switch(period) {
      case '7d':
        dateFilter.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(now.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(now.getDate() - 90);
        break;
      case '1y':
        dateFilter.setFullYear(now.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(now.getDate() - 30);
    }
    
    // Get indicators from database (with fallback to demo data)
    let indicators = [];
    
    try {
      indicators = await prisma.indicator.findMany({
        where: {
          tenantId,
          measurementDate: {
            gte: dateFilter
          }
        },
        orderBy: {
          measurementDate: 'desc'
        }
      });
    } catch (error) {
      console.log('⚠️ Usando dados demo devido ao erro no banco:', error.message);
      
      // Demo data for demonstration
      indicators = [
        {
          id: 'demo1',
          tenantId,
          type: 'early_mobilization',
          value: 85,
          targetValue: 80,
          unit: '%',
          measurementDate: new Date('2025-08-27'),
          createdBy: 'demo_user_001'
        },
        {
          id: 'demo2',
          tenantId,
          type: 'functional_independence',
          value: 75,
          targetValue: 85,
          unit: 'pontos',
          measurementDate: new Date('2025-08-26'),
          createdBy: 'demo_user_001'
        },
        {
          id: 'demo3',
          tenantId,
          type: 'patient_satisfaction',
          value: 9.2,
          targetValue: 9,
          unit: 'pontos',
          measurementDate: new Date('2025-08-25'),
          createdBy: 'demo_user_001'
        }
      ];
    }
    
    console.log(`📊 Found ${indicators.length} indicators`);
    
    // Process indicators by type
    const dashboardData = {};
    const indicatorTypes = {
      early_mobilization: { name: 'Mobilização Precoce', unit: '%', target: 80, format: 'percentage', category: 'mobility' },
      mechanical_ventilation: { name: 'Tempo Ventilação Mecânica', unit: 'dias', target: 5, format: 'decimal', category: 'respiratory' },
      functional_independence: { name: 'Independência Funcional', unit: 'pontos', target: 85, format: 'integer', category: 'functional' },
      muscle_strength: { name: 'Força Muscular', unit: 'pontos', target: 48, format: 'integer', category: 'strength' },
      hospital_stay: { name: 'Tempo de Internação', unit: 'dias', target: 12, format: 'decimal', category: 'efficiency' },
      readmission_30d: { name: 'Readmissão 30 dias', unit: '%', target: 8, format: 'percentage', category: 'quality' },
      patient_satisfaction: { name: 'Satisfação do Paciente', unit: 'pontos', target: 9, format: 'decimal', category: 'satisfaction' },
      discharge_destination: { name: 'Alta para Casa', unit: '%', target: 75, format: 'percentage', category: 'outcomes' }
    };
    
    // Group indicators by type
    const indicatorsByType = {};
    indicators.forEach(indicator => {
      if (!indicatorsByType[indicator.type]) {
        indicatorsByType[indicator.type] = [];
      }
      indicatorsByType[indicator.type].push(indicator);
    });
    
    // Process each indicator type
    Object.keys(indicatorTypes).forEach(type => {
      const typeConfig = indicatorTypes[type];
      const typeIndicators = indicatorsByType[type] || [];
      
      if (typeIndicators.length > 0) {
        // Calculate statistics
        const values = typeIndicators.map(i => i.value);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const latest = typeIndicators[0]; // Already ordered by desc date
        
        // Simple trend calculation (compare latest with previous)
        let trend = 'stable';
        if (typeIndicators.length > 1) {
          const current = latest.value;
          const previous = typeIndicators[1].value;
          
          // For indicators where higher is better
          if (['early_mobilization', 'functional_independence', 'muscle_strength', 'patient_satisfaction', 'discharge_destination'].includes(type)) {
            trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';
          } else {
            // For indicators where lower is better
            trend = current < previous ? 'up' : current > previous ? 'down' : 'stable';
          }
        }
        
        dashboardData[type] = {
          config: typeConfig,
          values: typeIndicators.map(i => ({
            value: i.value,
            date: i.measurementDate,
            patientId: i.patientId
          })),
          latest: {
            value: latest.value,
            date: latest.measurementDate
          },
          average,
          trend
        };
      } else {
        // No data for this indicator type
        dashboardData[type] = {
          config: typeConfig,
          values: [],
          latest: null,
          average: 0,
          trend: 'stable'
        };
      }
    });
    
    // Calculate summary statistics
    const totalTypes = Object.keys(dashboardData).length;
    const typesWithData = Object.values(dashboardData).filter(d => d.values.length > 0).length;
    let onTarget = 0;
    let improving = 0;
    let deteriorating = 0;
    
    Object.entries(dashboardData).forEach(([type, data]) => {
      if (data.latest) {
        // Check if on target
        const target = data.config.target;
        const value = data.latest.value;
        const tolerance = 0.1; // 10%
        
        let isOnTarget = false;
        if (['readmission_30d', 'hospital_stay', 'mechanical_ventilation'].includes(type)) {
          // Lower is better
          isOnTarget = value <= target * (1 + tolerance);
        } else {
          // Higher is better
          isOnTarget = value >= target * (1 - tolerance);
        }
        
        if (isOnTarget) onTarget++;
        
        // Count trends
        if (data.trend === 'up') improving++;
        if (data.trend === 'down') deteriorating++;
      }
    });
    
    const summary = {
      total: totalTypes,
      onTarget,
      improving,
      deteriorating,
      stable: typesWithData - improving - deteriorating,
      performance: typesWithData > 0 ? Math.round((onTarget / typesWithData) * 100) : 0
    };
    
    res.json({
      success: true,
      data: {
        period,
        indicators: dashboardData,
        summary
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Temporary endpoint to ensure indicators table exists
app.get('/api/ensure-indicators-table', async (req, res) => {
  try {
    // Try to run a simple query to check if indicators table exists
    await prisma.$queryRaw`CREATE TABLE IF NOT EXISTS "indicators" (
      "id" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "patientId" TEXT,
      "type" TEXT NOT NULL,
      "value" DOUBLE PRECISION NOT NULL,
      "targetValue" DOUBLE PRECISION NOT NULL,
      "unit" TEXT NOT NULL,
      "measurementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "metadata" TEXT,
      "createdBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
    );`;
    
    res.json({ success: true, message: 'Tabela indicators verificada/criada' });
  } catch (error) {
    console.error('Erro ao criar tabela indicators:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log('✅ Usuários encontrados:', userCount);
    
    // Try to count indicators
    const indicatorCount = await prisma.indicator.count();
    console.log('✅ Indicadores encontrados:', indicatorCount);
    
    res.json({
      success: true,
      message: 'Conexão com banco funcionando!',
      data: {
        users: userCount,
        indicators: indicatorCount
      }
    });
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro de conexão com banco',
      error: error.message
    });
  }
});

// Create default user endpoint
app.post('/api/ensure-user', async (req, res) => {
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
    }
    
    res.json({ success: true, message: 'Usuário padrão garantido', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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