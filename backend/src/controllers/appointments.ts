import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { appointmentSchema, querySchema, AppointmentStatus } from '@fisiohub/shared';

export const createAppointment = async (req: AuthRequest, res: Response) => {
  const validatedData = appointmentSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const patient = await prisma.patient.findFirst({
    where: { 
      id: validatedData.patientId,
      userId 
    }
  });
  
  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }
  
  const appointmentDate = new Date(validatedData.date);
  
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      userId,
      date: {
        gte: new Date(appointmentDate.getTime() - 30 * 60000),
        lte: new Date(appointmentDate.getTime() + 30 * 60000),
      },
      status: {
        in: ['SCHEDULED', 'CONFIRMED']
      }
    }
  });
  
  if (conflictingAppointment) {
    throw createError('Já existe um agendamento neste horário', 400);
  }
  
  const appointment = await prisma.appointment.create({
    data: {
      ...validatedData,
      date: appointmentDate,
      userId,
    },
    include: {
      patient: true
    }
  });
  
  res.status(201).json({
    success: true,
    message: 'Agendamento criado com sucesso',
    data: appointment
  });
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { page, limit, search } = querySchema.parse(req.query);
  const { date, status } = req.query;
  
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
    ...(date && {
      date: {
        gte: new Date(date as string),
        lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
      }
    }),
    ...(status && { status: status as string })
  };
  
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        patient: true,
        evolution: true
      }
    }),
    prisma.appointment.count({ where })
  ]);
  
  res.json({
    success: true,
    data: {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

export const getAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const appointment = await prisma.appointment.findFirst({
    where: { id, userId },
    include: {
      patient: true,
      evolution: true
    }
  });
  
  if (!appointment) {
    throw createError('Agendamento não encontrado', 404);
  }
  
  res.json({
    success: true,
    data: appointment
  });
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = appointmentSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingAppointment = await prisma.appointment.findFirst({
    where: { id, userId }
  });
  
  if (!existingAppointment) {
    throw createError('Agendamento não encontrado', 404);
  }
  
  const patient = await prisma.patient.findFirst({
    where: { 
      id: validatedData.patientId,
      userId 
    }
  });
  
  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }
  
  const appointmentDate = new Date(validatedData.date);
  
  if (appointmentDate.getTime() !== existingAppointment.date.getTime()) {
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        userId,
        id: { not: id },
        date: {
          gte: new Date(appointmentDate.getTime() - 30 * 60000),
          lte: new Date(appointmentDate.getTime() + 30 * 60000),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    });
    
    if (conflictingAppointment) {
      throw createError('Já existe um agendamento neste horário', 400);
    }
  }
  
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...validatedData,
      date: appointmentDate,
    },
    include: {
      patient: true,
      evolution: true
    }
  });
  
  res.json({
    success: true,
    message: 'Agendamento atualizado com sucesso',
    data: appointment
  });
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const existingAppointment = await prisma.appointment.findFirst({
    where: { id, userId }
  });
  
  if (!existingAppointment) {
    throw createError('Agendamento não encontrado', 404);
  }
  
  await prisma.appointment.delete({
    where: { id }
  });
  
  res.json({
    success: true,
    message: 'Agendamento removido com sucesso'
  });
};