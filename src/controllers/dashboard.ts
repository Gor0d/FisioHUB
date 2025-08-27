import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
// import { AppointmentStatus } from '@fisiohub/shared';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { hospitalId, serviceId } = req.query; // Novo parâmetro para filtrar por hospital e serviço específicos
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }
  
  // Buscar informações completas do usuário do banco de dados
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { specialty: true }
  });
  
  if (!user) {
    throw createError('Usuário não encontrado', 404);
  }
  
  const userSpecialty = user.specialty;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(thisWeekStart.getDate() + 7);
  
  // const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  // const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  // Se for usuário master (CEO MaisFisio), mostrar dados agregados de todos os hospitais
  const isMasterUser = userSpecialty === 'CEO MaisFisio';
  
  let whereClause: any;
  if (isMasterUser) {
    // Para usuário master, pode filtrar por hospital específico ou todos
    if (hospitalId && serviceId) {
      whereClause = { hospitalId: hospitalId as string, serviceId: serviceId as string };
    } else if (hospitalId) {
      whereClause = { hospitalId: hospitalId as string };
    } else if (serviceId) {
      whereClause = { serviceId: serviceId as string };
    } else {
      whereClause = {}; // Todos os hospitais e serviços
    }
  } else {
    // Para usuários normais, filtrar por userId e opcionalmente por serviço
    whereClause = serviceId ? { userId, serviceId: serviceId as string } : { userId };
  }
  
  const [
    totalPatients,
    // Dados de indicadores e escalas para hospital
    indicatorsToday,
    barthelScalesToday,
    mrcScalesToday,
  ] = await Promise.all([
    prisma.patient.count({
      where: { ...whereClause, isActive: true }
    }),
    
    // Indicadores de hoje
    prisma.indicator.count({
      where: {
        ...whereClause,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    
    // Escalas de Barthel de hoje
    prisma.barthelScale.count({
      where: {
        ...whereClause,
        evaluationDate: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
    
    // Escalas MRC de hoje
    prisma.mrcScale.count({
      where: {
        ...whereClause,
        evaluationDate: {
          gte: today,
          lt: tomorrow
        }
      }
    }),
  ]);
  
  let hospitalStats: any[] = [];
  let serviceStats: any[] = [];
  
  // Se for usuário master, buscar estatísticas por hospital
  if (isMasterUser) {
    let hospitalWhere: any = {};
    if (hospitalId) {
      hospitalWhere = { id: hospitalId as string };
    }
    
    const hospitals = await prisma.hospital.findMany({
      where: hospitalWhere,
      include: {
        _count: {
          select: {
            patients: { where: { isActive: true } },
            users: true,
            services: true,
          }
        }
      }
    });
    
    hospitalStats = hospitals.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      code: hospital.code,
      active: hospital.active,
      stats: hospital._count
    }));
    
    // Buscar serviços disponíveis
    const serviceWhere: any = { active: true };
    if (hospitalId) {
      serviceWhere.hospitalId = hospitalId as string;
    }
    
    const services = await prisma.service.findMany({
      where: serviceWhere,
      include: {
        hospital: { select: { name: true, code: true } },
        _count: {
          select: {
            users: true,
            patients: { where: { isActive: true } },
            indicators: true,
          }
        }
      }
    });
    
    serviceStats = services.map(service => ({
      id: service.id,
      name: service.name,
      code: service.code,
      color: service.color,
      icon: service.icon,
      hospitalId: service.hospitalId,
      hospitalName: service.hospital.name,
      hospitalCode: service.hospital.code,
      stats: service._count
    }));
  } else {
    // Para usuários normais, buscar apenas os serviços do seu hospital
    const userHospital = await prisma.user.findUnique({
      where: { id: userId },
      select: { hospitalId: true }
    });
    
    if (userHospital?.hospitalId) {
      const services = await prisma.service.findMany({
        where: { 
          hospitalId: userHospital.hospitalId,
          active: true 
        },
        include: {
          _count: {
            select: {
              users: true,
              patients: { where: { isActive: true } },
              indicators: true,
            }
          }
        }
      });
      
      serviceStats = services.map(service => ({
        id: service.id,
        name: service.name,
        code: service.code,
        color: service.color,
        icon: service.icon,
        hospitalId: service.hospitalId,
        stats: service._count
      }));
    }
  }
  
  const stats = {
    totalPatients,
    // Dados de indicadores e escalas para hospital
    indicatorsToday,
    barthelScalesToday,
    mrcScalesToday,
    // Total de atividades hoje
    totalActivitiesToday: indicatorsToday + barthelScalesToday + mrcScalesToday,
    // Dados específicos para usuário master
    isMasterUser,
    hospitals: hospitalStats,
    services: serviceStats
  };
  
  // Definir headers para evitar cache
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
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