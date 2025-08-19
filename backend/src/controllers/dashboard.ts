import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { AppointmentStatus } from '@fisiohub/shared';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(thisWeekStart.getDate() + 7);
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  const [
    totalPatients,
    totalAppointments,
    appointmentsToday,
    appointmentsThisWeek,
    appointmentsThisMonth,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.patient.count({
      where: { userId, isActive: true }
    }),
    
    prisma.appointment.count({
      where: { userId }
    }),
    
    prisma.appointment.count({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    
    prisma.appointment.count({
      where: {
        userId,
        date: {
          gte: thisWeekStart,
          lt: nextWeekStart
        }
      }
    }),
    
    prisma.appointment.count({
      where: {
        userId,
        date: {
          gte: thisMonthStart,
          lt: nextMonthStart
        }
      }
    }),
    
    prisma.appointment.aggregate({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED',
        price: { not: null }
      },
      _sum: {
        price: true
      }
    }),
    
    prisma.appointment.aggregate({
      where: {
        userId,
        date: {
          gte: thisWeekStart,
          lt: nextWeekStart
        },
        status: 'COMPLETED',
        price: { not: null }
      },
      _sum: {
        price: true
      }
    }),
    
    prisma.appointment.aggregate({
      where: {
        userId,
        date: {
          gte: thisMonthStart,
          lt: nextMonthStart
        },
        status: 'COMPLETED',
        price: { not: null }
      },
      _sum: {
        price: true
      }
    }),
  ]);
  
  const stats = {
    totalPatients,
    totalAppointments,
    appointmentsToday,
    appointmentsThisWeek,
    appointmentsThisMonth,
    revenue: {
      today: Number(revenueToday._sum.price) || 0,
      thisWeek: Number(revenueThisWeek._sum.price) || 0,
      thisMonth: Number(revenueThisMonth._sum.price) || 0,
    }
  };
  
  res.json({
    success: true,
    data: stats
  });
};

export const getUpcomingAppointments = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      date: {
        gte: now,
        lte: endOfDay
      },
      status: {
        in: ['SCHEDULED', 'CONFIRMED']
      }
    },
    orderBy: { date: 'asc' },
    take: 5,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    data: appointments
  });
};

export const getRecentEvolutions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  const evolutions = await prisma.evolution.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      },
      appointment: {
        select: {
          id: true,
          date: true
        }
      }
    }
  });
  
  res.json({
    success: true,
    data: evolutions
  });
};