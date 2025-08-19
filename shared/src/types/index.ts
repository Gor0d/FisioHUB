export interface User {
  id: string;
  email: string;
  name: string;
  crf?: string;
  phone?: string;
  specialty?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  RECEPTIONIST = 'RECEPTIONIST'
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
  address?: string;
  diagnosis?: string;
  observations?: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  date: Date;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
  userId: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  evolution?: Evolution;
}

export interface Evolution {
  id: string;
  symptoms?: string;
  treatment?: string;
  observations?: string;
  exercises?: string;
  nextSteps?: string;
  userId: string;
  patientId: string;
  appointmentId: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  appointment?: Appointment;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  crf?: string;
  phone?: string;
  specialty?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Indicator {
  id: string;
  date: Date;
  collaborator?: string;
  sector?: string;
  shift?: string;
  
  // Indicadores de Internação
  patientsHospitalized?: number;
  patientsPrescribed?: number;
  patientsCaptured?: number;
  discharges?: number;
  intubations?: number;
  
  // Indicadores Respiratórios
  respiratoryTherapyCount?: number;
  extubationEffectivenessRate?: number;
  deaths?: number;
  pcr?: number;
  respiratoryTherapyRate?: number;
  
  // Indicadores Motores
  motorTherapyRate?: number;
  artificialAirwayPatients?: number;
  aspirationRate?: number;
  
  // Indicadores de Mobilização
  sedestationExpected?: number;
  sedestationRate?: number;
  orthostatismExpected?: number;
  orthostatismRate?: number;
  ambulationRate?: number;
  
  // Outros Indicadores
  pronation?: number;
  oxygenTherapyPatients?: number;
  multidisciplinaryVisits?: number;
  nonInvasiveVentilationRate?: number;
  invasiveMechanicalVentRate?: number;
  tracheostomy?: number;
  nonAmbulatingPatients?: number;
  fallsAndIncidents?: number;
  
  userId: string;
  patientId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  patient?: Patient;
}

export interface BarthelScale {
  id: string;
  
  // 10 atividades da Escala de Barthel (0-100 pontos total)
  feeding: number; // 0, 5, 10
  bathing: number; // 0, 5
  grooming: number; // 0, 5
  dressing: number; // 0, 5, 10
  bowelControl: number; // 0, 5, 10
  bladderControl: number; // 0, 5, 10
  toileting: number; // 0, 5, 10
  transfer: number; // 0, 5, 10, 15
  mobility: number; // 0, 5, 10, 15
  stairs: number; // 0, 5, 10
  
  totalScore: number; // Soma total (0-100)
  classification: string; // Dependência total, severa, moderada, leve, independente
  type: 'ENTRADA' | 'SAIDA'; // Tipo da avaliação
  
  userId: string;
  patientId: string;
  evolutionId?: string;
  
  evaluationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  user?: User;
  patient?: Patient;
  evolution?: Evolution;
}

export interface MrcScale {
  id: string;
  
  // Grupos musculares - Medical Research Council (0-5 cada)
  shoulderAbduction: number; // Abdução do ombro
  elbowFlexion: number; // Flexão do cotovelo
  wristExtension: number; // Extensão do punho
  hipFlexion: number; // Flexão do quadril
  kneeExtension: number; // Extensão do joelho
  ankleFlexion: number; // Flexão do tornozelo
  
  // Grupos adicionais
  neckFlexion: number; // Flexão do pescoço
  trunkFlexion: number; // Flexão do tronco
  shoulderAdduction: number; // Adução do ombro
  elbowExtension: number; // Extensão do cotovelo
  
  totalScore: number; // Soma total
  averageScore: number; // Média (total/número de grupos)
  classification: string; // Classificação da força
  type: 'ENTRADA' | 'SAIDA'; // Tipo da avaliação
  
  userId: string;
  patientId: string;
  evolutionId?: string;
  
  evaluationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  user?: User;
  patient?: Patient;
  evolution?: Evolution;
}

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}