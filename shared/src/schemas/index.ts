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

export const indicatorSchema = z.object({
  date: z.string().optional(),
  collaborator: z.string().optional(),
  sector: z.string().optional(),
  shift: z.string().optional(),
  
  // Indicadores de Internação
  patientsHospitalized: z.number().min(0).optional(),
  patientsPrescribed: z.number().min(0).optional(),
  patientsCaptured: z.number().min(0).optional(),
  discharges: z.number().min(0).optional(),
  intubations: z.number().min(0).optional(),
  
  // Indicadores Respiratórios
  respiratoryTherapyCount: z.number().min(0).optional(),
  extubationEffectivenessRate: z.number().min(0).max(100).optional(),
  deaths: z.number().min(0).optional(),
  pcr: z.number().min(0).optional(),
  respiratoryTherapyRate: z.number().min(0).max(100).optional(),
  
  // Indicadores Motores
  motorTherapyRate: z.number().min(0).max(100).optional(),
  artificialAirwayPatients: z.number().min(0).optional(),
  aspirationRate: z.number().min(0).max(100).optional(),
  
  // Indicadores de Mobilização
  sedestationExpected: z.number().min(0).optional(),
  sedestationRate: z.number().min(0).max(100).optional(),
  orthostatismExpected: z.number().min(0).optional(),
  orthostatismRate: z.number().min(0).max(100).optional(),
  ambulationRate: z.number().min(0).max(100).optional(),
  
  // Outros Indicadores
  pronation: z.number().min(0).optional(),
  oxygenTherapyPatients: z.number().min(0).optional(),
  multidisciplinaryVisits: z.number().min(0).optional(),
  nonInvasiveVentilationRate: z.number().min(0).max(100).optional(),
  invasiveMechanicalVentRate: z.number().min(0).max(100).optional(),
  tracheostomy: z.number().min(0).optional(),
  nonAmbulatingPatients: z.number().min(0).optional(),
  fallsAndIncidents: z.number().min(0).optional(),
  
  patientId: z.string().optional(),
});

export const barthelScaleSchema = z.object({
  // 10 atividades da Escala de Barthel
  feeding: z.number().min(0).max(10),
  bathing: z.number().min(0).max(5),
  grooming: z.number().min(0).max(5),
  dressing: z.number().min(0).max(10),
  bowelControl: z.number().min(0).max(10),
  bladderControl: z.number().min(0).max(10),
  toileting: z.number().min(0).max(10),
  transfer: z.number().min(0).max(15),
  mobility: z.number().min(0).max(15),
  stairs: z.number().min(0).max(10),
  
  type: z.enum(['ENTRADA', 'SAIDA']).default('ENTRADA'),
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  evolutionId: z.string().optional(),
});

export const mrcScaleSchema = z.object({
  // Grupos musculares - Medical Research Council (0-5 cada)
  shoulderAbduction: z.number().min(0).max(5),
  elbowFlexion: z.number().min(0).max(5),
  wristExtension: z.number().min(0).max(5),
  hipFlexion: z.number().min(0).max(5),
  kneeExtension: z.number().min(0).max(5),
  ankleFlexion: z.number().min(0).max(5),
  
  // Grupos adicionais
  neckFlexion: z.number().min(0).max(5),
  trunkFlexion: z.number().min(0).max(5),
  shoulderAdduction: z.number().min(0).max(5),
  elbowExtension: z.number().min(0).max(5),
  
  type: z.enum(['ENTRADA', 'SAIDA']).default('ENTRADA'),
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  evolutionId: z.string().optional(),
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
export type IndicatorInput = z.infer<typeof indicatorSchema>;
export type BarthelScaleInput = z.infer<typeof barthelScaleSchema>;
export type MrcScaleInput = z.infer<typeof mrcScaleSchema>;
export type QueryInput = z.infer<typeof querySchema>;