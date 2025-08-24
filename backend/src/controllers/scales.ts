import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { barthelScaleSchema, mrcScaleSchema, querySchema } from '@fisiohub/shared';

export const createBarthelScale = async (req: AuthRequest, res: Response): Promise<Response> => {
  const validatedData = barthelScaleSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }

  // Verificar se o paciente pertence ao usuário
  const patient = await prisma.patient.findFirst({
    where: { id: validatedData.patientId, userId }
  });

  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }

  // Calcular score total e classificação
  const totalScore = validatedData.feeding + validatedData.bathing + validatedData.grooming +
    validatedData.dressing + validatedData.bowelControl + validatedData.bladderControl +
    validatedData.toileting + validatedData.transfer + validatedData.mobility + validatedData.stairs;

  let classification = '';
  if (totalScore >= 90) classification = 'Independente';
  else if (totalScore >= 60) classification = 'Dependência leve';
  else if (totalScore >= 40) classification = 'Dependência moderada';
  else if (totalScore >= 20) classification = 'Dependência severa';
  else classification = 'Dependência total';

  const barthelScale = await prisma.barthelScale.create({
    data: {
      ...validatedData,
      userId,
      totalScore,
      classification,
      evaluationDate: new Date(),
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          attendanceNumber: true,
          bedNumber: true
        }
      }
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Escala de Barthel criada com sucesso',
    data: barthelScale
  });
};

export const createMrcScale = async (req: AuthRequest, res: Response): Promise<Response> => {
  const validatedData = mrcScaleSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }

  // Verificar se o paciente pertence ao usuário
  const patient = await prisma.patient.findFirst({
    where: { id: validatedData.patientId, userId }
  });

  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }

  // Calcular score total e médio
  const totalScore = validatedData.shoulderAbduction + validatedData.elbowFlexion +
    validatedData.wristExtension + validatedData.hipFlexion + validatedData.kneeExtension +
    validatedData.ankleFlexion + validatedData.neckFlexion + validatedData.trunkFlexion +
    validatedData.shoulderAdduction + validatedData.elbowExtension;

  const averageScore = totalScore / 10;

  let classification = '';
  if (averageScore >= 4.5) classification = 'Força Normal/Excelente';
  else if (averageScore >= 4.0) classification = 'Boa Força Muscular';
  else if (averageScore >= 3.0) classification = 'Força Moderada';
  else if (averageScore >= 2.0) classification = 'Força Fraca';
  else if (averageScore >= 1.0) classification = 'Força Muito Fraca';
  else classification = 'Paralisia/Força Ausente';

  const mrcScale = await prisma.mrcScale.create({
    data: {
      ...validatedData,
      userId,
      totalScore,
      averageScore,
      classification,
      evaluationDate: new Date(),
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          attendanceNumber: true,
          bedNumber: true
        }
      }
    }
  });

  return res.status(201).json({
    success: true,
    message: 'Escala MRC criada com sucesso',
    data: mrcScale
  });
};

export const getBarthelScales = async (req: AuthRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  const { page, limit, search } = querySchema.parse(req.query);
  
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
    })
  };
  
  const [scales, total] = await Promise.all([
    prisma.barthelScale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { evaluationDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        }
      }
    }),
    prisma.barthelScale.count({ where })
  ]);
  
  return res.json({
    success: true,
    data: {
      data: scales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

export const getMrcScales = async (req: AuthRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  const { page, limit, search } = querySchema.parse(req.query);
  
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
    })
  };
  
  const [scales, total] = await Promise.all([
    prisma.mrcScale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { evaluationDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        }
      }
    }),
    prisma.mrcScale.count({ where })
  ]);
  
  return res.json({
    success: true,
    data: {
      data: scales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

export const getPatientImprovements = async (req: AuthRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  const { patientId } = req.params;
  const { startDate, endDate } = req.query;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }

  // Verificar se o paciente pertence ao usuário
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId }
  });

  if (!patient) {
    throw createError('Paciente não encontrado', 404);
  }

  const whereDate = {
    ...(startDate && endDate && {
      evaluationDate: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    })
  };

  // Buscar escalas Barthel
  const barthelScales = await prisma.barthelScale.findMany({
    where: {
      patientId,
      userId,
      ...whereDate
    },
    orderBy: { evaluationDate: 'asc' }
  });

  // Buscar escalas MRC
  const mrcScales = await prisma.mrcScale.findMany({
    where: {
      patientId,
      userId,
      ...whereDate
    },
    orderBy: { evaluationDate: 'asc' }
  });

  // Calcular melhorias Barthel
  const barthelImprovements = [];
  const barthelEntries = barthelScales.filter(s => s.type === 'ENTRADA');
  const barthelExits = barthelScales.filter(s => s.type === 'SAIDA');

  for (const exit of barthelExits) {
    // Encontrar a entrada mais recente antes desta saída
    const correspondingEntry = barthelEntries
      .filter(entry => entry.evaluationDate <= exit.evaluationDate)
      .sort((a, b) => b.evaluationDate.getTime() - a.evaluationDate.getTime())[0];

    if (correspondingEntry) {
      const improvement = exit.totalScore > correspondingEntry.totalScore;
      const scoreDifference = exit.totalScore - correspondingEntry.totalScore;
      
      barthelImprovements.push({
        entryId: correspondingEntry.id,
        exitId: exit.id,
        entryDate: correspondingEntry.evaluationDate,
        exitDate: exit.evaluationDate,
        entryScore: correspondingEntry.totalScore,
        exitScore: exit.totalScore,
        scoreDifference,
        improvement,
        entryClassification: correspondingEntry.classification,
        exitClassification: exit.classification
      });
    }
  }

  // Calcular melhorias MRC
  const mrcImprovements = [];
  const mrcEntries = mrcScales.filter(s => s.type === 'ENTRADA');
  const mrcExits = mrcScales.filter(s => s.type === 'SAIDA');

  for (const exit of mrcExits) {
    // Encontrar a entrada mais recente antes desta saída
    const correspondingEntry = mrcEntries
      .filter(entry => entry.evaluationDate <= exit.evaluationDate)
      .sort((a, b) => b.evaluationDate.getTime() - a.evaluationDate.getTime())[0];

    if (correspondingEntry) {
      const improvement = exit.averageScore > correspondingEntry.averageScore;
      const scoreDifference = exit.averageScore - correspondingEntry.averageScore;
      
      mrcImprovements.push({
        entryId: correspondingEntry.id,
        exitId: exit.id,
        entryDate: correspondingEntry.evaluationDate,
        exitDate: exit.evaluationDate,
        entryScore: correspondingEntry.averageScore,
        exitScore: exit.averageScore,
        scoreDifference,
        improvement,
        entryClassification: correspondingEntry.classification,
        exitClassification: exit.classification
      });
    }
  }

  return res.json({
    success: true,
    data: {
      patient,
      barthel: {
        improvements: barthelImprovements,
        totalComparisons: barthelImprovements.length,
        totalImprovements: barthelImprovements.filter(i => i.improvement).length
      },
      mrc: {
        improvements: mrcImprovements,
        totalComparisons: mrcImprovements.length,
        totalImprovements: mrcImprovements.filter(i => i.improvement).length
      },
      summary: {
        totalComparisons: barthelImprovements.length + mrcImprovements.length,
        totalImprovements: barthelImprovements.filter(i => i.improvement).length + 
                           mrcImprovements.filter(i => i.improvement).length
      }
    }
  });
};

export const getDashboardImprovements = async (req: AuthRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  const { startDate, endDate } = req.query;
  
  if (!userId) {
    throw createError('Usuário não autenticado', 401);
  }

  const whereDate = {
    ...(startDate && endDate && {
      evaluationDate: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    })
  };

  // Buscar todas as escalas do usuário no período
  const [barthelScales, mrcScales] = await Promise.all([
    prisma.barthelScale.findMany({
      where: {
        userId,
        ...whereDate
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { evaluationDate: 'asc' }
    }),
    prisma.mrcScale.findMany({
      where: {
        userId,
        ...whereDate
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { evaluationDate: 'asc' }
    })
  ]);

  // Calcular melhorias por paciente
  const patientsWithImprovements = new Map();

  // Processar Barthel
  const barthelByPatient = new Map();
  barthelScales.forEach(scale => {
    if (!barthelByPatient.has(scale.patientId)) {
      barthelByPatient.set(scale.patientId, { entries: [], exits: [] });
    }
    
    if (scale.type === 'ENTRADA') {
      barthelByPatient.get(scale.patientId).entries.push(scale);
    } else {
      barthelByPatient.get(scale.patientId).exits.push(scale);
    }
  });

  let totalBarthelImprovements = 0;
  barthelByPatient.forEach((scales, patientId) => {
    scales.exits.forEach((exit: any) => {
      const correspondingEntry = scales.entries
        .filter((entry: any) => entry.evaluationDate <= exit.evaluationDate)
        .sort((a: any, b: any) => b.evaluationDate.getTime() - a.evaluationDate.getTime())[0];

      if (correspondingEntry && exit.totalScore > correspondingEntry.totalScore) {
        totalBarthelImprovements++;
        
        if (!patientsWithImprovements.has(patientId)) {
          patientsWithImprovements.set(patientId, {
            patient: exit.patient,
            barthel: 0,
            mrc: 0
          });
        }
        patientsWithImprovements.get(patientId).barthel++;
      }
    });
  });

  // Processar MRC
  const mrcByPatient = new Map();
  mrcScales.forEach(scale => {
    if (!mrcByPatient.has(scale.patientId)) {
      mrcByPatient.set(scale.patientId, { entries: [], exits: [] });
    }
    
    if (scale.type === 'ENTRADA') {
      mrcByPatient.get(scale.patientId).entries.push(scale);
    } else {
      mrcByPatient.get(scale.patientId).exits.push(scale);
    }
  });

  let totalMrcImprovements = 0;
  mrcByPatient.forEach((scales, patientId) => {
    scales.exits.forEach((exit: any) => {
      const correspondingEntry = scales.entries
        .filter((entry: any) => entry.evaluationDate <= exit.evaluationDate)
        .sort((a: any, b: any) => b.evaluationDate.getTime() - a.evaluationDate.getTime())[0];

      if (correspondingEntry && exit.averageScore > correspondingEntry.averageScore) {
        totalMrcImprovements++;
        
        if (!patientsWithImprovements.has(patientId)) {
          patientsWithImprovements.set(patientId, {
            patient: exit.patient,
            barthel: 0,
            mrc: 0
          });
        }
        patientsWithImprovements.get(patientId).mrc++;
      }
    });
  });

  return res.json({
    success: true,
    data: {
      summary: {
        totalPatients: patientsWithImprovements.size,
        totalBarthelImprovements,
        totalMrcImprovements,
        totalImprovements: totalBarthelImprovements + totalMrcImprovements
      },
      patientBreakdown: Array.from(patientsWithImprovements.values()),
      period: {
        startDate: startDate || 'início',
        endDate: endDate || 'agora'
      }
    }
  });
};