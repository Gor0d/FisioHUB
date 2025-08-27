import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mrcScaleSchema } from '@fisiohub/shared';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getMrcScales = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10, patientId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };

    if (patientId) {
      where.patientId = patientId as string;
    }

    const [scales, total] = await Promise.all([
      prisma.mrcScale.findMany({
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
        orderBy: { evaluationDate: 'desc' }
      }),
      prisma.mrcScale.count({ where })
    ]);

    return res.json({
      success: true,
      data: scales,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar escalas MRC:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const createMrcScale = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId!;
    const data = req.body;
    
    const validatedData = mrcScaleSchema.parse(data);

    const muscleGroups = [
      'shoulderAbduction', 'elbowFlexion', 'wristExtension',
      'hipFlexion', 'kneeExtension', 'ankleFlexion',
      'neckFlexion', 'trunkFlexion', 'shoulderAdduction', 'elbowExtension'
    ] as const;

    const totalScore = muscleGroups.reduce((sum, muscle) => {
      const value = validatedData[muscle];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    const averageScore = Math.round((totalScore / muscleGroups.length) * 10) / 10;

    const getClassification = (average: number): string => {
      if (average >= 4.5) return 'Força Normal/Excelente';
      if (average >= 4.0) return 'Boa Força Muscular';
      if (average >= 3.0) return 'Força Moderada';
      if (average >= 2.0) return 'Força Fraca';
      if (average >= 1.0) return 'Força Muito Fraca';
      return 'Paralisia/Força Ausente';
    };

    const classification = getClassification(averageScore);

    const scale = await prisma.mrcScale.create({
      data: {
        ...validatedData,
        totalScore,
        averageScore,
        classification,
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
      message: 'Escala MRC criada com sucesso',
      data: scale
    });
  } catch (error: any) {
    console.error('Erro ao criar escala MRC:', error);
    
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