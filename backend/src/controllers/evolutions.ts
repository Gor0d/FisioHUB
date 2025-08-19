import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { evolutionSchema, querySchema } from '@fisiohub/shared';

export const createEvolution = async (req: AuthRequest, res: Response) => {
  const validatedData = evolutionSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const appointment = await prisma.appointment.findFirst({
    where: { 
      id: validatedData.appointmentId,
      userId 
    },
    include: {
      patient: true,
      evolution: true
    }
  });
  
  if (!appointment) {
    throw createError('Agendamento não encontrado', 404);
  }
  
  if (appointment.evolution) {
    throw createError('Este agendamento já possui uma evolução registrada', 400);
  }
  
  const evolution = await prisma.evolution.create({
    data: {
      ...validatedData,
      userId,
      patientId: appointment.patientId,
    },
    include: {
      patient: true,
      appointment: true
    }
  });
  
  res.status(201).json({
    success: true,
    message: 'Evolução registrada com sucesso',
    data: evolution
  });
};

export const getEvolutions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { page, limit, search } = querySchema.parse(req.query);
  const { patientId } = req.query;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const skip = (page - 1) * limit;
  
  const where = {
    userId,
    ...(search && {
      patient: {
        name: { contains: search, mode: 'insensitive' as const }
      }
    }),
    ...(patientId && { patientId: patientId as string })
  };
  
  const [evolutions, total] = await Promise.all([
    prisma.evolution.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        appointment: true
      }
    }),
    prisma.evolution.count({ where })
  ]);
  
  res.json({
    success: true,
    data: {
      data: evolutions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

export const getEvolution = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const evolution = await prisma.evolution.findFirst({
    where: { id, userId },
    include: {
      patient: true,
      appointment: true
    }
  });
  
  if (!evolution) {
    throw createError('Evolução não encontrada', 404);
  }
  
  res.json({
    success: true,
    data: evolution
  });
};

export const updateEvolution = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = evolutionSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingEvolution = await prisma.evolution.findFirst({
    where: { id, userId }
  });
  
  if (!existingEvolution) {
    throw createError('Evolução não encontrada', 404);
  }
  
  if (validatedData.appointmentId !== existingEvolution.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: { 
        id: validatedData.appointmentId,
        userId 
      },
      include: {
        evolution: true
      }
    });
    
    if (!appointment) {
      throw createError('Agendamento não encontrado', 404);
    }
    
    if (appointment.evolution && appointment.evolution.id !== id) {
      throw createError('Este agendamento já possui uma evolução registrada', 400);
    }
  }
  
  const evolution = await prisma.evolution.update({
    where: { id },
    data: validatedData,
    include: {
      patient: true,
      appointment: true
    }
  });
  
  res.json({
    success: true,
    message: 'Evolução atualizada com sucesso',
    data: evolution
  });
};

export const deleteEvolution = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingEvolution = await prisma.evolution.findFirst({
    where: { id, userId }
  });
  
  if (!existingEvolution) {
    throw createError('Evolução não encontrada', 404);
  }
  
  await prisma.evolution.delete({
    where: { id }
  });
  
  res.json({
    success: true,
    message: 'Evolução removida com sucesso'
  });
};