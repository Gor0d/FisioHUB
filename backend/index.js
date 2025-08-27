const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || process.env.API_PORT || 3001;

// In-memory storage for patients (in production this would be a database)
let patients = [
  {
    id: 'patient_1',
    name: 'João Silva',
    attendanceNumber: 'ATD001',
    bedNumber: '101A',
    isActive: true,
    admissionDate: '2025-08-25T10:00:00.000Z',
    email: 'joao@email.com',
    phone: '(11) 99999-0001',
    birthDate: '1980-05-15T00:00:00.000Z',
    address: 'Rua das Flores, 123',
    diagnosis: 'Recuperação pós-cirúrgica',
    observations: 'Paciente colaborativo',
    createdAt: '2025-08-25T10:00:00.000Z',
    updatedAt: '2025-08-25T10:00:00.000Z'
  },
  {
    id: 'patient_2', 
    name: 'Maria Santos',
    attendanceNumber: 'ATD002',
    bedNumber: '102B',
    isActive: true,
    admissionDate: '2025-08-26T14:30:00.000Z',
    email: 'maria@email.com',
    phone: '(11) 99999-0002',
    birthDate: '1975-10-22T00:00:00.000Z',
    address: 'Av. Principal, 456',
    diagnosis: 'Fisioterapia motora',
    observations: 'Necessita acompanhamento',
    createdAt: '2025-08-26T14:30:00.000Z',
    updatedAt: '2025-08-26T14:30:00.000Z'
  }
];

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
app.get('/api/patients', (req, res) => {
  const { status } = req.query;
  
  let filteredPatients = patients;
  
  // Filter by status if provided
  if (status === 'active') {
    filteredPatients = patients.filter(patient => patient.isActive);
  } else if (status === 'inactive') {
    filteredPatients = patients.filter(patient => !patient.isActive);
  }
  
  res.json({
    success: true,
    data: filteredPatients,
    total: filteredPatients.length
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
  
  // Check if attendanceNumber already exists
  const existingPatient = patients.find(p => p.attendanceNumber === attendanceNumber);
  if (existingPatient) {
    return res.status(409).json({
      success: false,
      message: 'Número de atendimento já existe'
    });
  }
  
  // Generate a patient ID
  const patientId = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Create new patient
  const newPatient = {
    id: patientId,
    name,
    email: email || null,
    phone,
    attendanceNumber,
    bedNumber: bedNumber || null,
    admissionDate,
    birthDate: birthDate || null,
    address: address || null,
    diagnosis: diagnosis || null,
    observations: observations || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to patients array
  patients.push(newPatient);
  
  console.log('📝 Novo paciente criado e adicionado:', newPatient);
  console.log('📊 Total de pacientes:', patients.length);
  
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