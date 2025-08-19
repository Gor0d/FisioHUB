import { z } from 'zod';
import { AppointmentStatus, UserRole } from '../types';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  crf: z.string().optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PHYSIOTHERAPIST),
});

export const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  diagnosis: z.string().optional(),
  observations: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  duration: z.number().min(15, 'Duração mínima de 15 minutos').default(60),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.SCHEDULED),
  notes: z.string().optional(),
  price: z.number().optional(),
});

export const evolutionSchema = z.object({
  appointmentId: z.string().min(1, 'Consulta é obrigatória'),
  symptoms: z.string().optional(),
  treatment: z.string().optional(),
  observations: z.string().optional(),
  exercises: z.string().optional(),
  nextSteps: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type EvolutionInput = z.infer<typeof evolutionSchema>;
export type QueryInput = z.infer<typeof querySchema>;