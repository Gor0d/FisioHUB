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
    const response = await fetch(`${process.env.API_URL || 'http://localhost:3001'}/api/indicators/types`);
    const typesData = await response.json();
    const indicatorConfig = typesData.data.config[type];
    
    if (!indicatorConfig) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de indicador inválido'
      });
    }
    
    // Create indicator in database
    const newIndicator = await prisma.indicator.create({
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
    
    console.log('📊 Novo indicador criado:', newIndicator);
    
    res.status(201).json({
      success: true,
      message: 'Indicador registrado com sucesso!',
      data: newIndicator
    });
  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Indicador duplicado'
      });
    }
    
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
      take: parseInt(limit),
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
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
    const { period = '30d', category } = req.query;
    
    console.log(`📊 Dashboard request - Tenant: ${tenantId}, Period: ${period}`);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Get indicators from database within period
    const whereClause = {
      tenantId: tenantId,
      measurementDate: {
        gte: startDate,
        lte: now
      }
    };
    
    const indicators = await prisma.indicator.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        measurementDate: 'desc'
      }
    });
    
    console.log(`📈 Found ${indicators.length} indicators for tenant ${tenantId}`);
    
    // Get indicator types configuration
    const indicatorTypesResponse = {
      early_mobilization: { name: 'Mobilização Precoce', unit: '%', target: 80, category: 'mobility' },
      mechanical_ventilation: { name: 'Tempo Ventilação Mecânica', unit: 'dias', target: 5, category: 'respiratory' },
      functional_independence: { name: 'Independência Funcional', unit: 'pontos', target: 85, category: 'functional' },
      muscle_strength: { name: 'Força Muscular', unit: 'pontos', target: 48, category: 'strength' },
      hospital_stay: { name: 'Tempo de Internação', unit: 'dias', target: 12, category: 'efficiency' },
      readmission_30d: { name: 'Readmissão 30 dias', unit: '%', target: 8, category: 'quality' },
      patient_satisfaction: { name: 'Satisfação do Paciente', unit: 'pontos', target: 9, category: 'satisfaction' },
      discharge_destination: { name: 'Alta para Casa', unit: '%', target: 75, category: 'outcomes' }
    };
    
    // Process indicators into dashboard format
    const dashboardData = {};
    const indicatorsByType = {};
    
    // Group indicators by type
    indicators.forEach(indicator => {
      if (!indicatorsByType[indicator.type]) {
        indicatorsByType[indicator.type] = [];
      }
      indicatorsByType[indicator.type].push(indicator);
    });
    
    // Build dashboard data for each type
    Object.entries(indicatorTypesResponse).forEach(([type, config]) => {
      const typeIndicators = indicatorsByType[type] || [];
      
      if (typeIndicators.length > 0) {
        const values = typeIndicators.map(ind => ({
          value: ind.value,
          date: ind.measurementDate.toISOString(),
          patientId: ind.patientId
        }));
        
        const latest = typeIndicators[0];
        const average = typeIndicators.reduce((sum, ind) => sum + ind.value, 0) / typeIndicators.length;
        
        // Simple trend calculation
        let trend = 'stable';
        if (typeIndicators.length > 1) {
          const recent = typeIndicators.slice(0, Math.ceil(typeIndicators.length / 2));
          const older = typeIndicators.slice(Math.ceil(typeIndicators.length / 2));
          
          const recentAvg = recent.reduce((sum, ind) => sum + ind.value, 0) / recent.length;
          const olderAvg = older.reduce((sum, ind) => sum + ind.value, 0) / older.length;
          
          if (recentAvg > olderAvg * 1.05) trend = 'up';
          else if (recentAvg < olderAvg * 0.95) trend = 'down';
        }
        
        dashboardData[type] = {
          config,
          values,
          latest: {
            value: latest.value,
            date: latest.measurementDate.toISOString()
          },
          average: Math.round(average * 100) / 100,
          trend
        };
      }
    });
    
    // Calculate summary
    const totalTypes = Object.keys(dashboardData).length;
    const onTarget = Object.values(dashboardData).filter(data => {
      const latest = data.latest?.value || 0;
      const target = data.config.target;
      // Different logic for different indicator types
      if (data.config.unit === '%' && data.config.category === 'quality') {
        return latest <= target; // Lower is better for readmission
      }
      if (data.config.unit === 'dias' && data.config.category === 'respiratory') {
        return latest <= target; // Lower is better for ventilation days  
      }
      if (data.config.unit === 'dias' && data.config.category === 'efficiency') {
        return latest <= target; // Lower is better for hospital stay
      }
      return latest >= target; // Higher is better for most others
    }).length;
    
    const improving = Object.values(dashboardData).filter(data => data.trend === 'up').length;
    const deteriorating = Object.values(dashboardData).filter(data => data.trend === 'down').length;
    const performance = totalTypes > 0 ? Math.round((onTarget / totalTypes) * 100) : 0;
    
    const summary = {
      total: totalTypes,
      onTarget,
      improving,
      deteriorating,
      performance
    };
    
    console.log(`📊 Dashboard summary:`, summary);
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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