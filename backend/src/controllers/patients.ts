import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { patientSchema, querySchema } from '@fisiohub/shared';

export const createPatient = async (req: AuthRequest, res: Response) => {
  const validatedData = patientSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  if (validatedData.cpf) {
    const existingPatient = await prisma.patient.findUnique({
      where: { cpf: validatedData.cpf }
    });
    
    if (existingPatient && existingPatient.userId === userId) {
      throw createError('CPF já está cadastrado', 400);
    }
  }
  
  const patient = await prisma.patient.create({
    data: {
      ...validatedData,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      userId,
    }
  });
  
  res.status(201).json({
    success: true,
    message: 'Paciente criado com sucesso',
    data: patient
  });
};

export const getPatients = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { page, limit, search } = querySchema.parse(req.query);
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const skip = (page - 1) * limit;
  
  const where = {
    userId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { cpf: { contains: search, mode: 'insensitive' as const } },
      ]
    })
  };
  
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            appointments: true,
            evolutions: true,
          }
        }
      }
    }),
    prisma.patient.count({ where })
  ]);
  
  res.json({
    success: true,
    data: {
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

export const getPatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const patient = await prisma.patient.findFirst({
    where: { id, userId },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          evolution: true
        }
      },
      _count: {
        select: {
          appointments: true,
          evolutions: true,
        }
      }
    }
  });
  
  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }
  
  res.json({
    success: true,
    data: patient
  });
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = patientSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingPatient = await prisma.patient.findFirst({
    where: { id, userId }
  });
  
  if (!existingPatient) {
    throw createError('Paciente não encontrado', 404);
  }
  
  if (validatedData.cpf && validatedData.cpf !== existingPatient.cpf) {
    const cpfExists = await prisma.patient.findFirst({
      where: { 
        cpf: validatedData.cpf,
        userId,
        id: { not: id }
      }
    });
    
    if (cpfExists) {
      throw createError('CPF já está cadastrado', 400);
    }
  }
  
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...validatedData,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
    }
  });
  
  res.json({
    success: true,
    message: 'Paciente atualizado com sucesso',
    data: patient
  });
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingPatient = await prisma.patient.findFirst({
    where: { id, userId }
  });
  
  if (!existingPatient) {
    throw createError('Paciente não encontrado', 404);
  }
  
  await prisma.patient.delete({
    where: { id }
  });
  
  res.json({
    success: true,
    message: 'Paciente removido com sucesso'
  });
};