import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { indicatorSchema } from '@fisiohub/shared';

export const getIndicators = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    const { page = 1, limit = 10, search, patientId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };

    if (patientId) {
      where.patientId = patientId as string;
    }

    if (search) {
      where.OR = [
        { collaborator: { contains: search as string, mode: 'insensitive' } },
        { sector: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [indicators, total] = await Promise.all([
      prisma.indicator.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          patient: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.indicator.count({ where })
    ]);

    return res.json({
      success: true,
      data: indicators,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const createIndicator = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    const validatedData = indicatorSchema.parse(req.body);

    const indicator = await prisma.indicator.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        patient: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Indicador criado com sucesso',
      data: indicator
    });
  } catch (error: any) {
    console.error('Erro ao criar indicador:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateIndicator = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    const { id } = req.params;
    
    const existingIndicator = await prisma.indicator.findFirst({
      where: { id, userId }
    });

    if (!existingIndicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicador não encontrado'
      });
    }

    const validatedData = indicatorSchema.parse(req.body);

    const indicator = await prisma.indicator.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : existingIndicator.date,
      }
    });

    return res.json({
      success: true,
      message: 'Indicador atualizado com sucesso',
      data: indicator
    });
  } catch (error: any) {
    console.error('Erro ao atualizar indicador:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const deleteIndicator = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    const { id } = req.params;

    const existingIndicator = await prisma.indicator.findFirst({
      where: { id, userId }
    });

    if (!existingIndicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicador não encontrado'
      });
    }

    await prisma.indicator.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Indicador deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar indicador:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getIndicatorStats = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    
    const total = await prisma.indicator.count({ where: { userId } });

    return res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getIndicatorById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  };
    const { id } = req.params;

    const indicator = await prisma.indicator.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        patient: {
          select: { id: true, name: true }
        }
      }
    });

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicador não encontrado'
      });
    }

    return res.json({
      success: true,
      data: indicator
    });
  } catch (error) {
    console.error('Erro ao buscar indicador:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};