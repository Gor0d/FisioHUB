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