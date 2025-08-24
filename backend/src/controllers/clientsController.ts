import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema de validação para criação de cliente
const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().optional(),
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).default('enterprise'),
  maxHospitals: z.number().min(1).default(5),
  maxUsers: z.number().min(1).default(100),
  hospitals: z.array(z.object({
    name: z.string().min(2, 'Nome do hospital é obrigatório'),
    code: z.string().min(2, 'Código do hospital é obrigatório'),
    adminName: z.string().min(2, 'Nome do administrador é obrigatório'),
    adminEmail: z.string().email('Email do administrador é inválido'),
    adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    services: z.array(z.object({
      name: z.string().min(2, 'Nome do serviço é obrigatório'),
      code: z.string().min(2, 'Código do serviço é obrigatório'),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
  }))
});

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).optional(),
  maxHospitals: z.number().min(1).optional(),
  maxUsers: z.number().min(1).optional(),
  active: z.boolean().optional(),
});

/**
 * Criar novo cliente com hospitais e serviços
 */
export const createClient = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = createClientSchema.parse(req.body);
    
    // Verificar se CNPJ já existe (se fornecido)
    if (validatedData.cnpj) {
      const existingClient = await prisma.client.findUnique({
        where: { cnpj: validatedData.cnpj }
      });
      
      if (existingClient) {
        throw createError('CNPJ já está em uso', 400);
      }
    }
    
    // Criar cliente, hospitais e serviços em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar cliente
      const client = await tx.client.create({
        data: {
          name: validatedData.name,
          cnpj: validatedData.cnpj,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          subscriptionPlan: validatedData.subscriptionPlan,
          maxHospitals: validatedData.maxHospitals,
          maxUsers: validatedData.maxUsers,
        }
      });
      
      const hospitals = [];
      
      // Criar hospitais e serviços
      for (const hospitalData of validatedData.hospitals) {
        // Criar hospital
        const hospital = await tx.hospital.create({
          data: {
            name: hospitalData.name,
            code: hospitalData.code,
            clientId: client.id,
          }
        });
        
        // Criar usuário administrador do hospital
        const hashedPassword = await bcrypt.hash(hospitalData.adminPassword, 12);
        const admin = await tx.user.create({
          data: {
            email: hospitalData.adminEmail,
            name: hospitalData.adminName,
            password: hashedPassword,
            role: 'ADMIN',
            hospitalId: hospital.id,
          }
        });
        
        const services = [];
        
        // Criar serviços do hospital
        for (const serviceData of hospitalData.services) {
          const service = await tx.service.create({
            data: {
              name: serviceData.name,
              code: serviceData.code,
              description: serviceData.description,
              color: serviceData.color || getDefaultColorForService(serviceData.name),
              icon: serviceData.icon || getDefaultIconForService(serviceData.name),
              hospitalId: hospital.id,
            }
          });
          
          services.push(service);
        }
        
        hospitals.push({
          ...hospital,
          admin: { ...admin, password: undefined }, // Não retornar senha
          services
        });
      }
      
      return { client, hospitals };
    });
    
    return res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: result
    });
    
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    
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
 * Listar todos os clientes
 */
export const listClients = async (req: Request, res: Response): Promise<Response> => {
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
        { contactEmail: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              hospitals: true,
            }
          },
          hospitals: {
            select: {
              id: true,
              name: true,
              code: true,
              active: true,
              _count: {
                select: {
                  users: true,
                  patients: true,
                  services: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where })
    ]);
    
    return res.json({
      success: true,
      data: clients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar cliente por ID
 */
export const getClientById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        hospitals: {
          include: {
            services: true,
            _count: {
              select: {
                users: true,
                patients: true,
                indicators: true,
              }
            }
          }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: client
    });
    
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar cliente
 */
export const updateClient = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const validatedData = updateClientSchema.parse(req.body);
    
    const client = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const updatedClient = await prisma.client.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            hospitals: true,
          }
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: updatedClient
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    
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
 * Obter estatísticas do cliente
 */
export const getClientStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        hospitals: {
          include: {
            _count: {
              select: {
                users: true,
                patients: true,
                services: true,
                indicators: true,
              }
            }
          }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Calcular totais
    const totals = client.hospitals.reduce((acc, hospital) => ({
      hospitals: acc.hospitals + 1,
      users: acc.users + hospital._count.users,
      patients: acc.patients + hospital._count.patients,
      services: acc.services + hospital._count.services,
      indicators: acc.indicators + hospital._count.indicators,
    }), { hospitals: 0, users: 0, patients: 0, services: 0, indicators: 0 });
    
    const stats = {
      client: {
        id: client.id,
        name: client.name,
        subscriptionPlan: client.subscriptionPlan,
        active: client.active,
      },
      totals,
      limits: {
        maxHospitals: client.maxHospitals,
        maxUsers: client.maxUsers,
        hospitalsUsed: totals.hospitals,
        usersUsed: totals.users,
        hospitalsRemaining: client.maxHospitals - totals.hospitals,
        usersRemaining: client.maxUsers - totals.users,
      },
      hospitals: client.hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        code: hospital.code,
        active: hospital.active,
        stats: hospital._count
      }))
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

// Helper functions para cores e ícones padrão (mesmo do servicesController)
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