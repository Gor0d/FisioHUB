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
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export type UserRole = 'admin' | 'user' | 'doctor' | 'nurse' | 'therapist';

export interface IndicatorInput {
  name: string;
  value: number;
  date: string;
}

export interface BarthelScaleInput {
  patientId: string;
  score: number;
  date: string;
}

export interface MrcScaleInput {
  patientId: string;
  score: number;
  date: string;
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