import { Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { TenantRequest } from '@/middleware/tenantResolver';

// Schema de validação para criação de serviço
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  code: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(50, 'Código deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Código deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
});

const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  active: z.boolean().optional(),
});

/**
 * Criar novo serviço no hospital
 */
export const createService = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const validatedData = createServiceSchema.parse(req.body);
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    // Verificar se código já existe no hospital
    const existingService = await prisma.service.findUnique({
      where: { 
        code_hospitalId: {
          code: validatedData.code,
          hospitalId: hospitalId
        }
      }
    });
    
    if (existingService) {
      throw createError('Código de serviço já está em uso neste hospital', 400);
    }
    
    // Criar serviço
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        description: validatedData.description,
        color: validatedData.color || getDefaultColorForService(validatedData.name),
        icon: validatedData.icon || getDefaultIconForService(validatedData.name),
        hospitalId: hospitalId,
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: service
    });
    
  } catch (error: any) {
    console.error('Erro ao criar serviço:', error);
    
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
 * Listar serviços do hospital
 */
export const listServices = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const hospitalId = req.hospital?.id;
    const { active, search } = req.query;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const where: any = { hospitalId };
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    const services = await prisma.service.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
            indicatorTemplates: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: services
    });
    
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar serviço por ID
 */
export const getServiceById = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const service = await prisma.service.findFirst({
      where: { 
        id,
        hospitalId 
      },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
            indicatorTemplates: true,
          }
        }
      }
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: service
    });
    
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar serviço
 */
export const updateService = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const validatedData = updateServiceSchema.parse(req.body);
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const existingService = await prisma.service.findFirst({
      where: { id, hospitalId }
    });
    
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
            indicatorTemplates: true,
          }
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: updatedService
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar serviço:', error);
    
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
 * Deletar serviço (soft delete)
 */
export const deleteService = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const service = await prisma.service.findFirst({
      where: { id, hospitalId },
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
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    // Verificar se há dados associados
    const hasData = service._count.users > 0 || 
                   service._count.patients > 0 || 
                   service._count.indicators > 0;
    
    if (hasData) {
      // Soft delete - apenas desativar
      await prisma.service.update({
        where: { id },
        data: { active: false }
      });
      
      return res.json({
        success: true,
        message: 'Serviço desativado com sucesso (dados preservados)'
      });
    } else {
      // Hard delete se não há dados
      await prisma.service.delete({
        where: { id }
      });
      
      return res.json({
        success: true,
        message: 'Serviço removido com sucesso'
      });
    }
    
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas do serviço
 */
export const getServiceStats = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const service = await prisma.service.findFirst({
      where: { id, hospitalId },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            indicators: true,
            indicatorTemplates: true,
            barthelScales: true,
            mrcScales: true,
          }
        }
      }
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    // Estatísticas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentIndicators, recentScales, activePatientsCount] = await Promise.all([
      prisma.indicator.count({
        where: {
          serviceId: id,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.barthelScale.count({
        where: {
          serviceId: id,
          createdAt: { gte: thirtyDaysAgo }
        }
      }) + prisma.mrcScale.count({
        where: {
          serviceId: id,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.patient.count({
        where: {
          serviceId: id,
          isActive: true
        }
      })
    ]);
    
    const stats = {
      service: {
        id: service.id,
        name: service.name,
        code: service.code,
        color: service.color,
        icon: service.icon,
        active: service.active,
      },
      totals: service._count,
      recent: {
        indicators: recentIndicators,
        scales: recentScales,
      },
      patients: {
        active: activePatientsCount,
        total: service._count.patients,
      }
    };
    
    return res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas do serviço:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Helper functions para cores e ícones padrão
function getDefaultColorForService(name: string): string {
  const serviceName = name.toLowerCase();
  
  if (serviceName.includes('fisio')) return '#10B981'; // Verde
  if (serviceName.includes('psico')) return '#3B82F6'; // Azul
  if (serviceName.includes('social')) return '#F59E0B'; // Âmbar
  if (serviceName.includes('nutri')) return '#EF4444'; // Vermelho
  if (serviceName.includes('terapeuta') && serviceName.includes('ocupacional')) return '#8B5CF6'; // Roxo
  
  return '#6B7280'; // Cinza padrão
}

function getDefaultIconForService(name: string): string {
  const serviceName = name.toLowerCase();
  
  if (serviceName.includes('fisio')) return 'heart';
  if (serviceName.includes('psico')) return 'brain';
  if (serviceName.includes('social')) return 'users';
  if (serviceName.includes('nutri')) return 'apple';
  if (serviceName.includes('terapeuta') && serviceName.includes('ocupacional')) return 'hand';
  
  return 'activity'; // Ícone padrão
}