import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { barthelScaleSchema } from '@fisiohub/shared';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getBarthelScales = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
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
      prisma.barthelScale.findMany({
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
      prisma.barthelScale.count({ where })
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
    console.error('Erro ao buscar escalas de Barthel:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const createBarthelScale = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId!;
    const data = req.body;
    
    console.log('📥 Dados recebidos para BarthelScale:', JSON.stringify(data, null, 2));
    console.log('👤 UserID:', userId);
    
    const validatedData = barthelScaleSchema.parse(data);
    console.log('✅ Dados validados:', JSON.stringify(validatedData, null, 2));

    const totalScore = 
      (validatedData.feeding || 0) +
      (validatedData.bathing || 0) +
      (validatedData.grooming || 0) +
      (validatedData.dressing || 0) +
      (validatedData.bowelControl || 0) +
      (validatedData.bladderControl || 0) +
      (validatedData.toileting || 0) +
      (validatedData.transfer || 0) +
      (validatedData.mobility || 0) +
      (validatedData.stairs || 0);

    const getClassification = (score: number): string => {
      if (score >= 90) return 'Independente';
      if (score >= 60) return 'Dependência leve';
      if (score >= 40) return 'Dependência moderada';
      if (score >= 20) return 'Dependência severa';
      return 'Dependência total';
    };

    const classification = getClassification(totalScore);
    console.log('🎯 Pontuação calculada:', totalScore, 'Classificação:', classification);

    // Preparar dados para criação
    const createData: any = {
      feeding: validatedData.feeding,
      bathing: validatedData.bathing,
      grooming: validatedData.grooming,
      dressing: validatedData.dressing,
      bowelControl: validatedData.bowelControl,
      bladderControl: validatedData.bladderControl,
      toileting: validatedData.toileting,
      transfer: validatedData.transfer,
      mobility: validatedData.mobility,
      stairs: validatedData.stairs,
      type: validatedData.type,
      totalScore,
      classification,
      userId,
      patientId: validatedData.patientId,
    };

    if (validatedData.evolutionId) {
      createData.evolutionId = validatedData.evolutionId;
    }

    if (validatedData.evaluationDate) {
      createData.evaluationDate = new Date(validatedData.evaluationDate);
    } else {
      createData.evaluationDate = new Date();
    }

    console.log('💾 Dados para criação no banco:', JSON.stringify(createData, null, 2));

    const scale = await prisma.barthelScale.create({
      data: createData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        patient: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('🎉 BarthelScale criado com sucesso:', scale.id);

    return res.status(201).json({
      success: true,
      message: 'Escala de Barthel criada com sucesso',
      data: scale
    });
  } catch (error: any) {
    console.error('❌ Erro detalhado ao criar escala de Barthel:', error);
    console.error('❌ Stack trace:', error.stack);
    
    if (error.name === 'ZodError') {
      console.error('❌ Erro de validação Zod:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Registro duplicado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};