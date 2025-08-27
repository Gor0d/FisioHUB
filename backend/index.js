const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || process.env.API_PORT || 3001;

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

// Mock patients endpoints
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'patient_1',
        name: 'João Silva',
        attendanceNumber: 'ATD001',
        bedNumber: '101A',
        isActive: true,
        admissionDate: '2025-08-25'
      },
      {
        id: 'patient_2', 
        name: 'Maria Santos',
        attendanceNumber: 'ATD002',
        bedNumber: '102B',
        isActive: true,
        admissionDate: '2025-08-26'
      }
    ]
  });
});

// POST endpoint for creating new patients
app.post('/api/patients', (req, res) => {
  const { name, email, phone, attendanceNumber, bedNumber, admissionDate, birthDate, address, diagnosis, observations } = req.body;
  
  // Validate required fields
  if (!name || !phone || !attendanceNumber || !admissionDate) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios: name, phone, attendanceNumber, admissionDate'
    });
  }
  
  // Generate a mock patient ID
  const patientId = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Mock successful creation
  const newPatient = {
    id: patientId,
    name,
    email,
    phone,
    attendanceNumber,
    bedNumber,
    admissionDate,
    birthDate,
    address,
    diagnosis,
    observations,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('📝 Novo paciente criado:', newPatient);
  
  res.status(201).json({
    success: true,
    message: 'Paciente cadastrado com sucesso!',
    data: newPatient
  });
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