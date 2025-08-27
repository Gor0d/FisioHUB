import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { TenantRequest } from '@/middleware/tenant';

// Definição dos campos de template
const fieldSchema = z.object({
  name: z.string().min(1, 'Nome do campo é obrigatório'),
  label: z.string().min(1, 'Label do campo é obrigatório'),
  type: z.enum(['number', 'percentage', 'text', 'boolean', 'select']),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(), // Para campos do tipo select
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
  description: z.string().optional(),
  category: z.string().optional(), // Categoria do indicador (Respiratórios, Motores, etc)
});

// Schema para criação de template
const createTemplateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  fields: z.array(fieldSchema).min(1, 'Pelo menos um campo é obrigatório'),
  serviceId: z.string().min(1, 'ID do serviço é obrigatório'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  fields: z.array(fieldSchema).optional(),
  active: z.boolean().optional(),
});

/**
 * Criar template de indicadores
 */
export const createTemplate = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const validatedData = createTemplateSchema.parse(req.body);
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    // Verificar se o serviço pertence ao hospital
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        hospitalId: hospitalId
      }
    });
    
    if (!service) {
      throw createError('Serviço não encontrado ou não pertence a este hospital', 404);
    }
    
    const template = await prisma.indicatorTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        fields: validatedData.fields,
        serviceId: validatedData.serviceId,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      data: template
    });
    
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    
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
 * Listar templates por serviço
 */
export const listTemplatesByService = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { serviceId } = req.params;
    const hospitalId = req.hospital?.id;
    const { active } = req.query;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    // Verificar se o serviço pertence ao hospital
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        hospitalId: hospitalId
      }
    });
    
    if (!service) {
      throw createError('Serviço não encontrado', 404);
    }
    
    const where: any = { serviceId };
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    const templates = await prisma.indicatorTemplate.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar todos os templates do hospital
 */
export const listTemplates = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const hospitalId = req.hospital?.id;
    const { active, serviceId } = req.query;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const where: any = {
      service: {
        hospitalId: hospitalId
      }
    };
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    if (serviceId) {
      where.serviceId = serviceId as string;
    }
    
    const templates = await prisma.indicatorTemplate.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar template por ID
 */
export const getTemplateById = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const template = await prisma.indicatorTemplate.findFirst({
      where: {
        id,
        service: {
          hospitalId: hospitalId
        }
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          }
        }
      }
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: template
    });
    
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar template
 */
export const updateTemplate = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const validatedData = updateTemplateSchema.parse(req.body);
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const existingTemplate = await prisma.indicatorTemplate.findFirst({
      where: {
        id,
        service: {
          hospitalId: hospitalId
        }
      }
    });
    
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }
    
    const updatedTemplate = await prisma.indicatorTemplate.update({
      where: { id },
      data: validatedData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      }
    });
    
    return res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: updatedTemplate
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar template:', error);
    
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
 * Deletar template
 */
export const deleteTemplate = async (req: TenantRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital?.id;
    
    if (!hospitalId) {
      throw createError('Hospital não identificado', 400);
    }
    
    const template = await prisma.indicatorTemplate.findFirst({
      where: {
        id,
        service: {
          hospitalId: hospitalId
        }
      }
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado'
      });
    }
    
    // Verificar se há indicadores usando este template
    const indicatorCount = await prisma.indicator.count({
      where: {
        serviceId: template.serviceId,
        // Aqui poderíamos verificar se o template está sendo usado
        // mas como os dados são JSON, seria complexo fazer essa verificação
      }
    });
    
    // Por segurança, fazer soft delete se há indicadores
    if (indicatorCount > 0) {
      await prisma.indicatorTemplate.update({
        where: { id },
        data: { active: false }
      });
      
      return res.json({
        success: true,
        message: 'Template desativado com sucesso (há indicadores usando este template)'
      });
    } else {
      await prisma.indicatorTemplate.delete({
        where: { id }
      });
      
      return res.json({
        success: true,
        message: 'Template removido com sucesso'
      });
    }
    
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter templates padrão para cada tipo de serviço
 */
export const getDefaultTemplates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const defaultTemplates = {
      fisioterapia: {
        name: "Indicadores de Fisioterapia Hospitalar",
        description: "Template padrão para indicadores de fisioterapia hospitalar",
        fields: [
          // Indicadores de Internação
          {
            name: "patientsHospitalized",
            label: "Pacientes Internados",
            type: "number",
            required: false,
            category: "Internação",
            description: "Número de pacientes internados no período"
          },
          {
            name: "patientsPrescribed",
            label: "Pacientes Prescritos",
            type: "number",
            required: false,
            category: "Internação"
          },
          {
            name: "patientsCaptured",
            label: "Pacientes Captados",
            type: "number",
            required: false,
            category: "Internação"
          },
          {
            name: "discharges",
            label: "Altas",
            type: "number",
            required: false,
            category: "Internação"
          },
          
          // Indicadores Respiratórios
          {
            name: "respiratoryTherapyCount",
            label: "Atendimentos Fisioterapia Respiratória",
            type: "number",
            required: false,
            category: "Respiratórios"
          },
          {
            name: "respiratoryTherapyRate",
            label: "Taxa de Fisioterapia Respiratória (%)",
            type: "percentage",
            required: false,
            category: "Respiratórios",
            validation: { min: 0, max: 100 }
          },
          {
            name: "extubationEffectivenessRate",
            label: "Taxa de Efetividade na Extubação (%)",
            type: "percentage",
            required: false,
            category: "Respiratórios",
            validation: { min: 0, max: 100 }
          },
          
          // Indicadores Motores
          {
            name: "motorTherapyRate",
            label: "Taxa de Fisioterapia Motora (%)",
            type: "percentage",
            required: false,
            category: "Motores",
            validation: { min: 0, max: 100 }
          },
          {
            name: "sedestationRate",
            label: "Taxa de Sedestação (%)",
            type: "percentage",
            required: false,
            category: "Motores",
            validation: { min: 0, max: 100 }
          },
          {
            name: "orthostatismRate",
            label: "Taxa de Ortostatismo (%)",
            type: "percentage",
            required: false,
            category: "Motores",
            validation: { min: 0, max: 100 }
          },
          {
            name: "ambulationRate",
            label: "Taxa de Deambulação (%)",
            type: "percentage",
            required: false,
            category: "Motores",
            validation: { min: 0, max: 100 }
          }
        ]
      },
      
      psicologia: {
        name: "Indicadores de Psicologia Hospitalar",
        description: "Template padrão para indicadores de psicologia hospitalar",
        fields: [
          {
            name: "psychologicalConsultations",
            label: "Consultas Psicológicas",
            type: "number",
            required: false,
            category: "Atendimentos"
          },
          {
            name: "groupTherapySessions",
            label: "Sessões de Terapia em Grupo",
            type: "number",
            required: false,
            category: "Atendimentos"
          },
          {
            name: "familySupport",
            label: "Atendimentos de Apoio à Família",
            type: "number",
            required: false,
            category: "Atendimentos"
          },
          {
            name: "patientSatisfactionRate",
            label: "Taxa de Satisfação do Paciente (%)",
            type: "percentage",
            required: false,
            category: "Qualidade",
            validation: { min: 0, max: 100 }
          }
        ]
      },
      
      "servico-social": {
        name: "Indicadores de Serviço Social Hospitalar",
        description: "Template padrão para indicadores de serviço social hospitalar",
        fields: [
          {
            name: "socialAssessments",
            label: "Avaliações Sociais",
            type: "number",
            required: false,
            category: "Avaliações"
          },
          {
            name: "socialInterventions",
            label: "Intervenções Sociais",
            type: "number",
            required: false,
            category: "Intervenções"
          },
          {
            name: "familyOrientations",
            label: "Orientações Familiares",
            type: "number",
            required: false,
            category: "Intervenções"
          },
          {
            name: "benefitRequests",
            label: "Solicitações de Benefícios",
            type: "number",
            required: false,
            category: "Benefícios"
          },
          {
            name: "benefitApprovalRate",
            label: "Taxa de Aprovação de Benefícios (%)",
            type: "percentage",
            required: false,
            category: "Benefícios",
            validation: { min: 0, max: 100 }
          }
        ]
      }
    };
    
    return res.json({
      success: true,
      data: defaultTemplates
    });
    
  } catch (error) {
    console.error('Erro ao obter templates padrão:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export default {
  createTemplate,
  listTemplatesByService,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplates,
};