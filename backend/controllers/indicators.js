const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Definição dos tipos de indicadores
const INDICATOR_TYPES = {
  EARLY_MOBILIZATION: 'early_mobilization',
  MECHANICAL_VENTILATION: 'mechanical_ventilation', 
  FUNCTIONAL_INDEPENDENCE: 'functional_independence',
  MUSCLE_STRENGTH: 'muscle_strength',
  HOSPITAL_STAY: 'hospital_stay',
  READMISSION_30D: 'readmission_30d',
  PATIENT_SATISFACTION: 'patient_satisfaction',
  DISCHARGE_DESTINATION: 'discharge_destination'
};

// Configuração dos indicadores
const INDICATOR_CONFIG = {
  [INDICATOR_TYPES.EARLY_MOBILIZATION]: {
    name: 'Taxa de Mobilização Precoce',
    description: 'Percentual de pacientes mobilizados nas primeiras 48h',
    unit: '%',
    target: 80,
    format: 'percentage',
    category: 'mobility'
  },
  [INDICATOR_TYPES.MECHANICAL_VENTILATION]: {
    name: 'Tempo de Ventilação Mecânica',
    description: 'Tempo médio em ventilação mecânica',
    unit: 'dias',
    target: 5,
    format: 'decimal',
    category: 'respiratory'
  },
  [INDICATOR_TYPES.FUNCTIONAL_INDEPENDENCE]: {
    name: 'Independência Funcional (Barthel)',
    description: 'Score médio da escala Barthel na alta',
    unit: 'pontos',
    target: 75,
    format: 'integer',
    category: 'functional'
  },
  [INDICATOR_TYPES.MUSCLE_STRENGTH]: {
    name: 'Força Muscular (MRC)',
    description: 'Score médio da escala MRC',
    unit: 'pontos',
    target: 48,
    format: 'integer',
    category: 'strength'
  },
  [INDICATOR_TYPES.HOSPITAL_STAY]: {
    name: 'Tempo de Internação',
    description: 'Tempo médio de permanência hospitalar',
    unit: 'dias',
    target: 12,
    format: 'decimal',
    category: 'efficiency'
  },
  [INDICATOR_TYPES.READMISSION_30D]: {
    name: 'Readmissão em 30 dias',
    description: 'Taxa de readmissão em 30 dias',
    unit: '%',
    target: 10,
    format: 'percentage',
    category: 'quality'
  },
  [INDICATOR_TYPES.PATIENT_SATISFACTION]: {
    name: 'Satisfação do Paciente',
    description: 'Score médio de satisfação',
    unit: 'pontos',
    target: 8.5,
    format: 'decimal',
    category: 'satisfaction'
  }
};

class IndicatorsController {
  /**
   * Create or update indicator value
   */
  static async recordIndicator(req, res) {
    try {
      const { tenantId, patientId, type, value, measurementDate, metadata } = req.body;

      if (!tenantId || !type || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'tenantId, type e value são obrigatórios'
        });
      }

      if (!INDICATOR_TYPES[type.toUpperCase()]) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de indicador inválido'
        });
      }

      const indicatorId = `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const config = INDICATOR_CONFIG[type];

      const indicator = await prisma.indicator.create({
        data: {
          id: indicatorId,
          tenantId,
          patientId: patientId || null,
          type,
          value: parseFloat(value),
          targetValue: config.target,
          unit: config.unit,
          measurementDate: measurementDate ? new Date(measurementDate) : new Date(),
          metadata: metadata || {},
          createdBy: req.user?.id || 'system'
        }
      });

      res.json({
        success: true,
        data: indicator,
        message: 'Indicador registrado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao registrar indicador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get indicators dashboard data
   */
  static async getDashboard(req, res) {
    try {
      const { tenantId } = req.params;
      const { period = '30d', category } = req.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Build where clause
      const whereClause = {
        tenantId,
        measurementDate: {
          gte: startDate,
          lte: endDate
        }
      };

      if (category) {
        const typesInCategory = Object.entries(INDICATOR_CONFIG)
          .filter(([_, config]) => config.category === category)
          .map(([type, _]) => type);
        
        whereClause.type = { in: typesInCategory };
      }

      // Get raw indicators data
      const indicators = await prisma.indicator.findMany({
        where: whereClause,
        orderBy: { measurementDate: 'desc' }
      });

      // Process data for dashboard
      const dashboardData = this.processIndicatorsForDashboard(indicators);

      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate,
          indicators: dashboardData,
          summary: this.generateSummary(dashboardData)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get specific indicator trends
   */
  static async getIndicatorTrends(req, res) {
    try {
      const { tenantId, type } = req.params;
      const { period = '30d' } = req.query;

      if (!INDICATOR_TYPES[type.toUpperCase()]) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de indicador inválido'
        });
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

      const indicators = await prisma.indicator.findMany({
        where: {
          tenantId,
          type,
          measurementDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { measurementDate: 'asc' }
      });

      const config = INDICATOR_CONFIG[type];
      const trendData = this.calculateTrends(indicators, config);

      res.json({
        success: true,
        data: {
          type,
          config,
          period,
          trends: trendData,
          latest: indicators[indicators.length - 1] || null,
          count: indicators.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar trends:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Process indicators data for dashboard
   */
  static processIndicatorsForDashboard(indicators) {
    const processed = {};

    // Group by type
    indicators.forEach(indicator => {
      if (!processed[indicator.type]) {
        processed[indicator.type] = {
          config: INDICATOR_CONFIG[indicator.type],
          values: [],
          latest: null,
          average: 0,
          trend: 'stable'
        };
      }

      processed[indicator.type].values.push({
        value: indicator.value,
        date: indicator.measurementDate,
        patientId: indicator.patientId
      });
    });

    // Calculate statistics for each type
    Object.keys(processed).forEach(type => {
      const data = processed[type];
      
      if (data.values.length > 0) {
        // Sort by date
        data.values.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Latest value
        data.latest = data.values[data.values.length - 1];
        
        // Average
        const sum = data.values.reduce((acc, v) => acc + v.value, 0);
        data.average = sum / data.values.length;
        
        // Trend calculation (simple: compare first half with second half)
        if (data.values.length >= 4) {
          const halfPoint = Math.floor(data.values.length / 2);
          const firstHalf = data.values.slice(0, halfPoint);
          const secondHalf = data.values.slice(halfPoint);
          
          const firstAvg = firstHalf.reduce((acc, v) => acc + v.value, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((acc, v) => acc + v.value, 0) / secondHalf.length;
          
          const difference = ((secondAvg - firstAvg) / firstAvg) * 100;
          
          if (difference > 5) {
            data.trend = 'up';
          } else if (difference < -5) {
            data.trend = 'down';
          } else {
            data.trend = 'stable';
          }
        }
      }
    });

    return processed;
  }

  /**
   * Calculate trends for specific indicator
   */
  static calculateTrends(indicators, config) {
    if (indicators.length === 0) return [];

    return indicators.map((indicator, index) => {
      let trend = 'stable';
      
      if (index > 0) {
        const previous = indicators[index - 1].value;
        const current = indicator.value;
        const change = ((current - previous) / previous) * 100;
        
        if (change > 2) {
          trend = 'up';
        } else if (change < -2) {
          trend = 'down';
        }
      }

      return {
        date: indicator.measurementDate,
        value: indicator.value,
        target: config.target,
        trend,
        isOnTarget: this.isOnTarget(indicator.value, config),
        patientId: indicator.patientId
      };
    });
  }

  /**
   * Check if value is on target
   */
  static isOnTarget(value, config) {
    const threshold = 0.1; // 10% tolerance
    
    switch (config.category) {
      case 'efficiency':
      case 'respiratory':
        // Lower is better
        return value <= config.target * (1 + threshold);
      
      case 'quality':
        // Lower is better for readmission, etc.
        return value <= config.target * (1 + threshold);
      
      default:
        // Higher is better
        return value >= config.target * (1 - threshold);
    }
  }

  /**
   * Generate summary statistics
   */
  static generateSummary(dashboardData) {
    const types = Object.keys(dashboardData);
    const total = types.length;
    
    let onTarget = 0;
    let improving = 0;
    let deteriorating = 0;

    types.forEach(type => {
      const data = dashboardData[type];
      
      if (data.latest && this.isOnTarget(data.latest.value, data.config)) {
        onTarget++;
      }
      
      if (data.trend === 'up') {
        improving++;
      } else if (data.trend === 'down') {
        deteriorating++;
      }
    });

    return {
      total,
      onTarget,
      improving,
      deteriorating,
      stable: total - improving - deteriorating,
      performance: total > 0 ? Math.round((onTarget / total) * 100) : 0
    };
  }

  /**
   * Get available indicator types
   */
  static getIndicatorTypes(req, res) {
    res.json({
      success: true,
      data: {
        types: INDICATOR_TYPES,
        config: INDICATOR_CONFIG
      }
    });
  }
}

module.exports = {
  IndicatorsController,
  INDICATOR_TYPES,
  INDICATOR_CONFIG
};