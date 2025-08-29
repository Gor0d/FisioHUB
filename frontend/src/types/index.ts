// Tipos temporários para substituir @fisiohub/shared

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  diagnosis?: string;
  observations?: string;
  isActive?: boolean;
  // Campos hospitalares
  attendanceNumber?: string;
  bedNumber?: string;
  room?: string;
  sector?: string;
  cid?: string;
  admissionDate?: string;
  dischargeDate?: string;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  // Relations
  userId?: string;
  tenantId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  specialty?: string;
  role?: UserRole;
  crf?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export type UserRole = 'admin' | 'user' | 'doctor' | 'nurse' | 'therapist' | 'physiotherapist' | 'receptionist';

// User roles as constants for form usage
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  USER: 'user' as const,
  DOCTOR: 'doctor' as const,
  NURSE: 'nurse' as const,
  THERAPIST: 'therapist' as const,
  PHYSIOTHERAPIST: 'physiotherapist' as const,
  RECEPTIONIST: 'receptionist' as const
} as const;

export interface IndicatorInput {
  name: string;
  value: number;
  date: string;
  patientId?: string;
  collaborator?: string;
  sector?: string;
  shift?: string;
  // Campos específicos dos indicadores
  patientsHospitalized?: number;
  patientsPrescribed?: number;
  patientsReceived?: number;
  sessionsTotal?: number;
  sessionsCompleted?: number;
  sessionsCancelled?: number;
  averageSessionTime?: number;
  patientsSatisfied?: number;
  improvementRate?: number;
  dischargeRate?: number;
  readmissionRate?: number;
  complicationRate?: number;
  mortalityRate?: number;
  [key: string]: string | number | undefined;
}

export interface BarthelScaleInput {
  patientId: string;
  score: number;
  date: string;
  evolutionId?: string;
  type?: string;
  feeding?: number;
  bathing?: number;
  grooming?: number;
  dressing?: number;
  bowelControl?: number;
  bladderControl?: number;
  toileting?: number;
  transfer?: number;
  mobility?: number;
  stairs?: number;
  [key: string]: string | number | undefined;
}

export interface MrcScaleInput {
  patientId: string;
  score: number;
  date: string;
  evolutionId?: string;
  type?: string;
  // Campos específicos do MRC (músculos avaliados)
  shoulderAbduction?: number;
  elbowFlexion?: number;
  wristExtension?: number;
  hipFlexion?: number;
  kneeExtension?: number;
  ankleFlexion?: number;
  [key: string]: string | number | undefined;
}

// CID Codes básicos
export const CID_CODES = [
  { code: 'G80', description: 'Paralisia cerebral' },
  { code: 'G81', description: 'Hemiplegia' },
  { code: 'G82', description: 'Paraplegia e tetraplegia' },
  { code: 'M79', description: 'Outros transtornos dos tecidos moles' },
  { code: 'M25', description: 'Outros transtornos articulares' },
  { code: 'S72', description: 'Fratura do fêmur' },
  { code: 'S82', description: 'Fratura da perna' },
  { code: 'I64', description: 'Acidente vascular cerebral' },
];

// Service interface
export interface Service {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  stats: {
    users: number;
    patients: number;
    indicators: number;
  };
}

// Função helper para formatação
export function formatPatientDisplay(patient: Patient): string {
  const parts = [patient.name];
  
  if (patient.attendanceNumber) {
    parts.push(`#${patient.attendanceNumber}`);
  }
  
  if (patient.cpf) {
    parts.push(`(${patient.cpf})`);
  }
  
  return parts.join(' ');
}