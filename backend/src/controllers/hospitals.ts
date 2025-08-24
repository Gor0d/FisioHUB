import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema de validação para criação de hospital
const createHospitalSchema = z.object({
  subdomain: z.string()
    .min(3, 'Subdomínio deve ter pelo menos 3 caracteres')
    .max(50, 'Subdomínio deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  adminName: z.string().min(2, 'Nome do administrador é obrigatório'),
  adminEmail: z.string().email('Email inválido'),
  adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).default('basic'),
  maxUsers: z.number().min(1).default(10),
});

const updateHospitalSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  maxUsers: z.number().min(1).optional(),
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).optional(),
  active: z.boolean().optional(),
});

/**
 * Criar novo hospital com usuário administrador
 */
export const createHospital = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = createHospitalSchema.parse(req.body);
    
    // Verificar se subdomínio já existe
    const existingHospital = await prisma.hospital.findUnique({
      where: { subdomain: validatedData.subdomain }
    });
    
    if (existingHospital) {
      throw createError('Subdomínio já está em uso', 400);
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.adminEmail }
    });
    
    if (existingUser) {
      throw createError('Email já está cadastrado', 400);
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 12);
    
    // Criar hospital e usuário admin em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar hospital
      const hospital = await tx.hospital.create({
        data: {
          subdomain: validatedData.subdomain,
          name: validatedData.name,
          subscriptionPlan: validatedData.subscriptionPlan,
          maxUsers: validatedData.maxUsers,
        }
      });
      
      // Criar usuário administrador
      const admin = await tx.user.create({
        data: {
          email: validatedData.adminEmail,
          name: validatedData.adminName,
          password: hashedPassword,
          role: 'ADMIN',
          hospitalId: hospital.id,
        }
      });
      
      return { hospital, admin };
    });
    
    // Não retornar senha no response
    const { password: _, ...adminWithoutPassword } = result.admin;
    
    return res.status(201).json({
      success: true,
      message: 'Hospital criado com sucesso',
      data: {
        hospital: result.hospital,
        admin: adminWithoutPassword,
        loginUrl: `https://${validatedData.subdomain}.fisiohub.com.br/login`
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao criar hospital:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar todos os hospitais (apenas para super admin)
 */
export const listHospitals = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    
    const where: any = {};
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { subdomain: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
              indicators: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hospital.count({ where })
    ]);
    
    return res.json({
      success: true,
      data: hospitals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar hospitais:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar hospital por subdomínio
 */
export const getHospitalBySubdomain = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { subdomain } = req.params;
    
    const hospital = await prisma.hospital.findUnique({
      where: { subdomain },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
          }
        }
      }
    });
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital não encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: hospital
    });
    
  } catch (error) {
    console.error('Erro ao buscar hospital:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar hospital
 */
export const updateHospital = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const validatedData = updateHospitalSchema.parse(req.body);
    
    const hospital = await prisma.hospital.findUnique({
      where: { id }
    });
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital não encontrado'
      });
    }
    
    const updatedHospital = await prisma.hospital.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
          }
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Hospital atualizado com sucesso',
      data: updatedHospital
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar hospital:', error);
    
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

/**
 * Obter estatísticas do hospital
 */
export const getHospitalStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
            barthelScales: true,
            mrcScales: true,
          }
        }
      }
    });
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital não encontrado'
      });
    }
    
    // Estatísticas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentIndicators, recentScales] = await Promise.all([
      prisma.indicator.count({
        where: {
          hospitalId: id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.barthelScale.count({
        where: {
          hospitalId: id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }) + prisma.mrcScale.count({
        where: {
          hospitalId: id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);
    
    const stats = {
      hospital: {
        id: hospital.id,
        name: hospital.name,
        subdomain: hospital.subdomain,
        subscriptionPlan: hospital.subscriptionPlan,
        active: hospital.active,
      },
      totals: hospital._count,
      recent: {
        indicators: recentIndicators,
        scales: recentScales,
      },
      limits: {
        maxUsers: hospital.maxUsers,
        usersUsed: hospital._count.users,
        usersRemaining: hospital.maxUsers - hospital._count.users,
      }
    };
    
    return res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};