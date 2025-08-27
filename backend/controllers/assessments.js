const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuração das escalas
const SCALE_TYPES = {
  MRC: 'mrc',
  BARTHEL: 'barthel'
};

const MRC_SCALE_CONFIG = {
  name: 'Escala MRC (Medical Research Council)',
  description: 'Avaliação de força muscular',
  maxScore: 60,
  muscles: [
    { name: 'Flexão do ombro', side: 'right', maxScore: 5 },
    { name: 'Flexão do ombro', side: 'left', maxScore: 5 },
    { name: 'Abdução do ombro', side: 'right', maxScore: 5 },
    { name: 'Abdução do ombro', side: 'left', maxScore: 5 },
    { name: 'Flexão do cotovelo', side: 'right', maxScore: 5 },
    { name: 'Flexão do cotovelo', side: 'left', maxScore: 5 },
    { name: 'Flexão do quadril', side: 'right', maxScore: 5 },
    { name: 'Flexão do quadril', side: 'left', maxScore: 5 },
    { name: 'Extensão do joelho', side: 'right', maxScore: 5 },
    { name: 'Extensão do joelho', side: 'left', maxScore: 5 },
    { name: 'Dorsiflexão do tornozelo', side: 'right', maxScore: 5 },
    { name: 'Dorsiflexão do tornozelo', side: 'left', maxScore: 5 }
  ],
  scoreInterpretation: [
    { range: '0', description: 'Nenhuma contração visível' },
    { range: '1', description: 'Contração visível sem movimento' },
    { range: '2', description: 'Movimento com eliminação da gravidade' },
    { range: '3', description: 'Movimento contra a gravidade' },
    { range: '4', description: 'Movimento contra resistência moderada' },
    { range: '5', description: 'Força normal' }
  ]
};

const BARTHEL_SCALE_CONFIG = {
  name: 'Índice de Barthel',
  description: 'Avaliação de independência funcional para atividades de vida diária',
  maxScore: 100,
  activities: [
    { name: 'Alimentação', maxScore: 10, options: [
      { score: 0, description: 'Incapaz' },
      { score: 5, description: 'Precisa de ajuda para cortar, passar manteiga, etc.' },
      { score: 10, description: 'Independente' }
    ]},
    { name: 'Banho', maxScore: 5, options: [
      { score: 0, description: 'Dependente' },
      { score: 5, description: 'Independente (ou no chuveiro)' }
    ]},
    { name: 'Cuidado pessoal', maxScore: 5, options: [
      { score: 0, description: 'Precisa de ajuda com cuidado pessoal' },
      { score: 5, description: 'Independente (face/cabelo/dentes/barbear)' }
    ]},
    { name: 'Vestir-se', maxScore: 10, options: [
      { score: 0, description: 'Dependente' },
      { score: 5, description: 'Precisa de ajuda, mas consegue fazer metade sem ajuda' },
      { score: 10, description: 'Independente (incluindo botões, zíper, laços)' }
    ]},
    { name: 'Intestino', maxScore: 10, options: [
      { score: 0, description: 'Incontinente (ou precisa de enemas)' },
      { score: 5, description: 'Acidente ocasional' },
      { score: 10, description: 'Continente' }
    ]},
    { name: 'Bexiga', maxScore: 10, options: [
      { score: 0, description: 'Incontinente, ou cateterizado e incapaz de manejo' },
      { score: 5, description: 'Acidente ocasional' },
      { score: 10, description: 'Continente' }
    ]},
    { name: 'Uso do vaso sanitário', maxScore: 10, options: [
      { score: 0, description: 'Dependente' },
      { score: 5, description: 'Precisa de alguma ajuda, mas consegue fazer algumas coisas sozinho' },
      { score: 10, description: 'Independente (sentar, levantar, limpar-se)' }
    ]},
    { name: 'Transferência (cama-cadeira)', maxScore: 15, options: [
      { score: 0, description: 'Incapaz, sem equilíbrio para sentar' },
      { score: 5, description: 'Grande ajuda (uma ou duas pessoas), consegue sentar' },
      { score: 10, description: 'Pequena ajuda (verbal ou física)' },
      { score: 15, description: 'Independente' }
    ]},
    { name: 'Mobilidade (no plano)', maxScore: 15, options: [
      { score: 0, description: 'Imóvel ou < 50 jardas' },
      { score: 5, description: 'Cadeira de rodas independente, inclui esquinas, > 50 jardas' },
      { score: 10, description: 'Anda com ajuda de uma pessoa (verbal ou física) > 50 jardas' },
      { score: 15, description: 'Independente (mas pode usar qualquer ajuda; ex: bengala) > 50 jardas' }
    ]},
    { name: 'Escadas', maxScore: 10, options: [
      { score: 0, description: 'Incapaz' },
      { score: 5, description: 'Precisa de ajuda (verbal, física, carregando ajuda)' },
      { score: 10, description: 'Independente' }
    ]}
  ],
  scoreInterpretation: [
    { range: '0-20', description: 'Dependência total', level: 'severe' },
    { range: '21-60', description: 'Dependência severa', level: 'moderate' },
    { range: '61-90', description: 'Dependência moderada', level: 'mild' },
    { range: '91-99', description: 'Dependência leve', level: 'light' },
    { range: '100', description: 'Independente', level: 'independent' }
  ]
};

class AssessmentsController {
  /**
   * Create new assessment (MRC or Barthel)
   */
  static async createAssessment(req, res) {
    try {
      const { tenantId, patientId, scaleType, scores, observations, assessedBy } = req.body;

      if (!tenantId || !patientId || !scaleType || !scores) {
        return res.status(400).json({
          success: false,
          message: 'tenantId, patientId, scaleType e scores são obrigatórios'
        });
      }

      if (!Object.values(SCALE_TYPES).includes(scaleType)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de escala inválido'
        });
      }

      // Calculate total score
      let totalScore = 0;
      let maxScore = 0;

      if (scaleType === SCALE_TYPES.MRC) {
        maxScore = MRC_SCALE_CONFIG.maxScore;
        totalScore = Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
      } else if (scaleType === SCALE_TYPES.BARTHEL) {
        maxScore = BARTHEL_SCALE_CONFIG.maxScore;
        totalScore = Object.values(scores).reduce((sum, score) => sum + (parseInt(score) || 0), 0);
      }

      const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const assessment = await prisma.assessment.create({
        data: {
          id: assessmentId,
          tenantId,
          patientId,
          scaleType,
          scores: JSON.stringify(scores),
          totalScore,
          maxScore,
          percentage: Math.round((totalScore / maxScore) * 100),
          observations: observations || '',
          assessedBy: assessedBy || req.user?.id || 'system',
          assessmentDate: new Date(),
          createdAt: new Date()
        }
      });

      res.json({
        success: true,
        data: {
          ...assessment,
          scores: JSON.parse(assessment.scores)
        },
        message: 'Avaliação criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get assessments for a patient
   */
  static async getPatientAssessments(req, res) {
    try {
      const { tenantId, patientId } = req.params;
      const { scaleType, limit = 10 } = req.query;

      const whereClause = {
        tenantId,
        patientId
      };

      if (scaleType) {
        whereClause.scaleType = scaleType;
      }

      const assessments = await prisma.assessment.findMany({
        where: whereClause,
        orderBy: { assessmentDate: 'desc' },
        take: parseInt(limit)
      });

      const processedAssessments = assessments.map(assessment => ({
        ...assessment,
        scores: JSON.parse(assessment.scores || '{}')
      }));

      res.json({
        success: true,
        data: processedAssessments
      });

    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get assessment evolution/trends
   */
  static async getAssessmentTrends(req, res) {
    try {
      const { tenantId, patientId, scaleType } = req.params;
      const { period = '90d' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

      const assessments = await prisma.assessment.findMany({
        where: {
          tenantId,
          patientId,
          scaleType,
          assessmentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { assessmentDate: 'asc' }
      });

      const trends = assessments.map(assessment => ({
        date: assessment.assessmentDate,
        totalScore: assessment.totalScore,
        percentage: assessment.percentage,
        maxScore: assessment.maxScore
      }));

      // Calculate improvement
      const improvement = trends.length >= 2 
        ? trends[trends.length - 1].totalScore - trends[0].totalScore
        : 0;

      res.json({
        success: true,
        data: {
          scaleType,
          period,
          trends,
          improvement,
          assessmentCount: trends.length,
          latest: trends[trends.length - 1] || null
        }
      });

    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get assessment by ID
   */
  static async getAssessment(req, res) {
    try {
      const { id } = req.params;

      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          patient: {
            select: { name: true, medicalRecord: true }
          }
        }
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          ...assessment,
          scores: JSON.parse(assessment.scores || '{}')
        }
      });

    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get scale configurations
   */
  static getScaleConfigs(req, res) {
    res.json({
      success: true,
      data: {
        types: SCALE_TYPES,
        configs: {
          [SCALE_TYPES.MRC]: MRC_SCALE_CONFIG,
          [SCALE_TYPES.BARTHEL]: BARTHEL_SCALE_CONFIG
        }
      }
    });
  }

  /**
   * Get assessment statistics for tenant
   */
  static async getAssessmentStats(req, res) {
    try {
      const { tenantId } = req.params;
      const { period = '30d' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

      // Total assessments
      const totalAssessments = await prisma.assessment.count({
        where: {
          tenantId,
          assessmentDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Assessments by type
      const mrcCount = await prisma.assessment.count({
        where: {
          tenantId,
          scaleType: SCALE_TYPES.MRC,
          assessmentDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const barthelCount = await prisma.assessment.count({
        where: {
          tenantId,
          scaleType: SCALE_TYPES.BARTHEL,
          assessmentDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Average scores
      const avgScores = await prisma.assessment.groupBy({
        by: ['scaleType'],
        where: {
          tenantId,
          assessmentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _avg: {
          totalScore: true,
          percentage: true
        }
      });

      const stats = {
        period,
        totalAssessments,
        byType: {
          mrc: mrcCount,
          barthel: barthelCount
        },
        averageScores: avgScores.reduce((acc, item) => {
          acc[item.scaleType] = {
            totalScore: Math.round(item._avg.totalScore || 0),
            percentage: Math.round(item._avg.percentage || 0)
          };
          return acc;
        }, {})
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
}

module.exports = {
  AssessmentsController,
  SCALE_TYPES,
  MRC_SCALE_CONFIG,
  BARTHEL_SCALE_CONFIG
};