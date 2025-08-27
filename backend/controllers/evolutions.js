const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tipos de evolução
const EVOLUTION_TYPES = {
  INITIAL_ASSESSMENT: 'initial_assessment',
  DAILY_EVOLUTION: 'daily_evolution', 
  PROGRESS_NOTE: 'progress_note',
  DISCHARGE_SUMMARY: 'discharge_summary',
  INTERCURRENCE: 'intercurrence'
};

// Categorias de evolução
const EVOLUTION_CATEGORIES = {
  RESPIRATORY: 'respiratory',
  MOTOR: 'motor',
  COGNITIVE: 'cognitive',
  FUNCTIONAL: 'functional',
  GENERAL: 'general'
};

// Template de campos por tipo de evolução
const EVOLUTION_TEMPLATES = {
  [EVOLUTION_TYPES.INITIAL_ASSESSMENT]: {
    name: 'Avaliação Inicial',
    fields: [
      { name: 'chief_complaint', label: 'Queixa Principal', type: 'textarea', required: true },
      { name: 'medical_history', label: 'História Médica', type: 'textarea', required: true },
      { name: 'physical_exam', label: 'Exame Físico', type: 'textarea', required: true },
      { name: 'functional_status', label: 'Status Funcional', type: 'textarea', required: true },
      { name: 'treatment_goals', label: 'Objetivos do Tratamento', type: 'textarea', required: true },
      { name: 'treatment_plan', label: 'Plano de Tratamento', type: 'textarea', required: true }
    ]
  },
  [EVOLUTION_TYPES.DAILY_EVOLUTION]: {
    name: 'Evolução Diária',
    fields: [
      { name: 'subjective', label: 'Subjetivo (S)', type: 'textarea', required: true },
      { name: 'objective', label: 'Objetivo (O)', type: 'textarea', required: true },
      { name: 'assessment', label: 'Avaliação (A)', type: 'textarea', required: true },
      { name: 'plan', label: 'Plano (P)', type: 'textarea', required: true },
      { name: 'vital_signs', label: 'Sinais Vitais', type: 'text' },
      { name: 'pain_scale', label: 'Escala de Dor (0-10)', type: 'number', min: 0, max: 10 }
    ]
  },
  [EVOLUTION_TYPES.PROGRESS_NOTE]: {
    name: 'Nota de Progresso',
    fields: [
      { name: 'progress_summary', label: 'Resumo do Progresso', type: 'textarea', required: true },
      { name: 'functional_gains', label: 'Ganhos Funcionais', type: 'textarea' },
      { name: 'limitations', label: 'Limitações Identificadas', type: 'textarea' },
      { name: 'treatment_modifications', label: 'Modificações no Tratamento', type: 'textarea' },
      { name: 'next_goals', label: 'Próximos Objetivos', type: 'textarea' }
    ]
  },
  [EVOLUTION_TYPES.DISCHARGE_SUMMARY]: {
    name: 'Resumo de Alta',
    fields: [
      { name: 'admission_status', label: 'Status na Admissão', type: 'textarea', required: true },
      { name: 'treatments_provided', label: 'Tratamentos Realizados', type: 'textarea', required: true },
      { name: 'functional_outcomes', label: 'Resultados Funcionais', type: 'textarea', required: true },
      { name: 'discharge_status', label: 'Status na Alta', type: 'textarea', required: true },
      { name: 'home_program', label: 'Programa Domiciliar', type: 'textarea' },
      { name: 'recommendations', label: 'Recomendações', type: 'textarea' }
    ]
  },
  [EVOLUTION_TYPES.INTERCURRENCE]: {
    name: 'Intercorrência',
    fields: [
      { name: 'incident_description', label: 'Descrição da Intercorrência', type: 'textarea', required: true },
      { name: 'immediate_actions', label: 'Ações Imediatas', type: 'textarea', required: true },
      { name: 'outcome', label: 'Desfecho', type: 'textarea' },
      { name: 'prevention_measures', label: 'Medidas Preventivas', type: 'textarea' },
      { name: 'severity', label: 'Gravidade', type: 'select', options: ['Leve', 'Moderada', 'Grave'] }
    ]
  }
};

class EvolutionsController {
  /**
   * Create new evolution
   */
  static async createEvolution(req, res) {
    try {
      const { 
        tenantId, 
        patientId, 
        type, 
        category,
        title, 
        content, 
        structuredData, 
        physiotherapistId 
      } = req.body;

      if (!tenantId || !patientId || !type || !content) {
        return res.status(400).json({
          success: false,
          message: 'tenantId, patientId, type e content são obrigatórios'
        });
      }

      if (!Object.values(EVOLUTION_TYPES).includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de evolução inválido'
        });
      }

      const evolutionId = `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const evolution = await prisma.evolution.create({
        data: {
          id: evolutionId,
          tenantId,
          patientId,
          userId: physiotherapistId || req.user?.id || 'system',
          type,
          category: category || EVOLUTION_CATEGORIES.GENERAL,
          title: title || EVOLUTION_TEMPLATES[type]?.name || 'Evolução',
          content,
          structuredData: structuredData ? JSON.stringify(structuredData) : null,
          evolutionDate: new Date(),
          createdAt: new Date()
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          patient: {
            select: { id: true, name: true, medicalRecord: true, bedNumber: true }
          }
        }
      });

      res.json({
        success: true,
        data: {
          ...evolution,
          structuredData: evolution.structuredData ? JSON.parse(evolution.structuredData) : null
        },
        message: 'Evolução criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar evolução:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get evolutions for a patient
   */
  static async getPatientEvolutions(req, res) {
    try {
      const { tenantId, patientId } = req.params;
      const { type, category, limit = 20, page = 1 } = req.query;

      const whereClause = {
        tenantId,
        patientId
      };

      if (type) whereClause.type = type;
      if (category) whereClause.category = category;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [evolutions, totalCount] = await Promise.all([
        prisma.evolution.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { evolutionDate: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.evolution.count({ where: whereClause })
      ]);

      const processedEvolutions = evolutions.map(evolution => ({
        ...evolution,
        structuredData: evolution.structuredData ? JSON.parse(evolution.structuredData) : null
      }));

      res.json({
        success: true,
        data: {
          evolutions: processedEvolutions,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar evoluções:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get evolution by ID
   */
  static async getEvolution(req, res) {
    try {
      const { id } = req.params;

      const evolution = await prisma.evolution.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          patient: {
            select: { id: true, name: true, medicalRecord: true, bedNumber: true }
          }
        }
      });

      if (!evolution) {
        return res.status(404).json({
          success: false,
          message: 'Evolução não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          ...evolution,
          structuredData: evolution.structuredData ? JSON.parse(evolution.structuredData) : null
        }
      });

    } catch (error) {
      console.error('Erro ao buscar evolução:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Update evolution
   */
  static async updateEvolution(req, res) {
    try {
      const { id } = req.params;
      const { title, content, structuredData, category } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content é obrigatório'
        });
      }

      const evolution = await prisma.evolution.update({
        where: { id },
        data: {
          title,
          content,
          category,
          structuredData: structuredData ? JSON.stringify(structuredData) : undefined,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          patient: {
            select: { id: true, name: true, medicalRecord: true }
          }
        }
      });

      res.json({
        success: true,
        data: {
          ...evolution,
          structuredData: evolution.structuredData ? JSON.parse(evolution.structuredData) : null
        },
        message: 'Evolução atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar evolução:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Delete evolution
   */
  static async deleteEvolution(req, res) {
    try {
      const { id } = req.params;

      await prisma.evolution.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Evolução excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir evolução:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get evolution statistics
   */
  static async getEvolutionStats(req, res) {
    try {
      const { tenantId } = req.params;
      const { period = '30d', physiotherapistId } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

      const whereClause = {
        tenantId,
        evolutionDate: {
          gte: startDate,
          lte: endDate
        }
      };

      if (physiotherapistId) {
        whereClause.userId = physiotherapistId;
      }

      // Total evolutions
      const totalEvolutions = await prisma.evolution.count({ where: whereClause });

      // By type
      const byType = await prisma.evolution.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { type: true }
      });

      // By category  
      const byCategory = await prisma.evolution.groupBy({
        by: ['category'],
        where: whereClause,
        _count: { category: true }
      });

      // By physiotherapist
      const byPhysiotherapist = await prisma.evolution.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: { userId: true },
        include: {
          user: {
            select: { name: true }
          }
        }
      });

      // Recent evolutions
      const recentEvolutions = await prisma.evolution.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true } },
          patient: { select: { name: true } }
        },
        orderBy: { evolutionDate: 'desc' },
        take: 5
      });

      const stats = {
        period,
        totalEvolutions,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count.category;
          return acc;
        }, {}),
        byPhysiotherapist: byPhysiotherapist.map(item => ({
          userId: item.userId,
          count: item._count.userId
        })),
        recentEvolutions: recentEvolutions.map(evolution => ({
          id: evolution.id,
          type: evolution.type,
          title: evolution.title,
          patientName: evolution.patient.name,
          physiotherapistName: evolution.user.name,
          evolutionDate: evolution.evolutionDate
        }))
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get evolution templates
   */
  static getEvolutionTemplates(req, res) {
    res.json({
      success: true,
      data: {
        types: EVOLUTION_TYPES,
        categories: EVOLUTION_CATEGORIES,
        templates: EVOLUTION_TEMPLATES
      }
    });
  }

  /**
   * Get evolutions for tenant (all patients)
   */
  static async getTenantEvolutions(req, res) {
    try {
      const { tenantId } = req.params;
      const { 
        type, 
        category, 
        physiotherapistId,
        startDate,
        endDate,
        limit = 50,
        page = 1 
      } = req.query;

      const whereClause = { tenantId };

      if (type) whereClause.type = type;
      if (category) whereClause.category = category;
      if (physiotherapistId) whereClause.userId = physiotherapistId;

      if (startDate || endDate) {
        whereClause.evolutionDate = {};
        if (startDate) whereClause.evolutionDate.gte = new Date(startDate);
        if (endDate) whereClause.evolutionDate.lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [evolutions, totalCount] = await Promise.all([
        prisma.evolution.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, name: true, role: true }
            },
            patient: {
              select: { id: true, name: true, medicalRecord: true, bedNumber: true }
            }
          },
          orderBy: { evolutionDate: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.evolution.count({ where: whereClause })
      ]);

      const processedEvolutions = evolutions.map(evolution => ({
        ...evolution,
        structuredData: evolution.structuredData ? JSON.parse(evolution.structuredData) : null
      }));

      res.json({
        success: true,
        data: {
          evolutions: processedEvolutions,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar evoluções do tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = {
  EvolutionsController,
  EVOLUTION_TYPES,
  EVOLUTION_CATEGORIES,
  EVOLUTION_TEMPLATES
};