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

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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