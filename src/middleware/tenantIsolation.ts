import { Response, NextFunction } from 'express';
import { TenantRequest } from '@/middleware/tenantResolver';
import { tenantPrisma, getTenantPrisma } from '@/lib/tenantPrisma';
import { createError } from '@/middleware/errorHandler';

export interface TenantIsolatedRequest extends TenantRequest {
  tenantDb: typeof tenantPrisma;
}

/**
 * Middleware para aplicar isolamento de dados por tenant
 * Deve ser usado APÓS o tenantResolver
 */
export const tenantIsolation = async (
  req: TenantIsolatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      throw createError('Contexto de tenant necessário. Use tenantResolver primeiro.', 400);
    }
    
    // Verificar se o schema do tenant existe
    const schemaExists = await tenantPrisma.schemaExists(req.tenant.schema);
    
    if (!schemaExists) {
      console.log(`Schema ${req.tenant.schema} não existe. Criando...`);
      await tenantPrisma.createTenantSchema(req.tenant.schema);
    }
    
    // Configurar o Prisma para usar o schema do tenant
    req.tenantDb = await getTenantPrisma(req.tenant.schema);
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏥 [${req.method}] ${req.path} - Tenant: ${req.tenant.name} (Schema: ${req.tenant.schema})`);
    }
    
    next();
  } catch (error: any) {
    console.error('Erro no middleware de isolamento de tenant:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: 'TENANT_ISOLATION_ERROR'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno no isolamento de tenant',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware para verificar limites do plano do tenant
 */
export const checkTenantLimits = (resource: string, action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' = 'CREATE') => {
  return async (req: TenantIsolatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) {
        throw createError('Contexto de tenant necessário', 400);
      }
      
      // Buscar assinatura ativa do tenant
      const subscription = await tenantPrisma.tenantSubscription.findFirst({
        where: {
          tenantId: req.tenant.id,
          status: 'active'
        },
        include: {
          plan: true
        }
      });
      
      if (!subscription) {
        throw createError(
          'Assinatura ativa necessária para acessar esta funcionalidade', 
          402
        );
      }
      
      const limits = subscription.plan.limits as any;
      
      // Verificar limite apenas para criação de recursos
      if (action === 'CREATE' && limits[resource] !== undefined) {
        const currentCount = await getCurrentResourceCount(
          req.tenantDb,
          resource
        );
        
        if (currentCount >= limits[resource]) {
          throw createError(
            `Limite de ${resource} atingido (${limits[resource]}). Faça upgrade do seu plano.`,
            402
          );
        }
      }
      
      // Adicionar informações do plano na request para uso posterior
      req.tenantPlan = {
        name: subscription.plan.name,
        slug: subscription.plan.slug,
        limits: limits,
        features: subscription.plan.features as any
      };
      
      next();
    } catch (error: any) {
      console.error('Erro na verificação de limites:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'PLAN_LIMIT_ERROR',
          upgrade_required: error.statusCode === 402
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno na verificação de limites'
      });
    }
  };
};

/**
 * Helper para obter a contagem atual de um recurso
 */
async function getCurrentResourceCount(
  tenantDb: typeof tenantPrisma,
  resource: string
): Promise<number> {
  try {
    switch (resource) {
      case 'hospitals':
        return await tenantDb.hospital.count();
      
      case 'users':
        return await tenantDb.user.count({ where: { active: true } });
      
      case 'services':
        return await tenantDb.service.count({ where: { active: true } });
      
      case 'patients':
        return await tenantDb.patient.count({ where: { isActive: true } });
      
      case 'indicators_monthly':
        // Contar indicadores do mês atual
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        return await tenantDb.indicator.count({
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });
      
      default:
        console.warn(`Recurso '${resource}' não reconhecido para contagem`);
        return 0;
    }
  } catch (error) {
    console.error(`Erro ao contar recurso '${resource}':`, error);
    return 0;
  }
}

/**
 * Middleware para verificar se uma feature está habilitada no plano
 */
export const requireTenantFeature = (feature: string) => {
  return async (req: TenantIsolatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) {
        throw createError('Contexto de tenant necessário', 400);
      }
      
      // Se já temos informações do plano da verificação de limites, usar
      if (req.tenantPlan) {
        const features = req.tenantPlan.features;
        
        if (!features[feature]) {
          throw createError(
            `Funcionalidade '${feature}' não disponível no seu plano. Faça upgrade para acessar.`,
            403
          );
        }
        
        return next();
      }
      
      // Caso contrário, buscar do banco
      const subscription = await tenantPrisma.tenantSubscription.findFirst({
        where: {
          tenantId: req.tenant.id,
          status: 'active'
        },
        include: {
          plan: true
        }
      });
      
      if (!subscription) {
        throw createError('Assinatura ativa necessária', 402);
      }
      
      const features = subscription.plan.features as any;
      
      if (!features[feature]) {
        throw createError(
          `Funcionalidade '${feature}' não disponível no seu plano. Faça upgrade para acessar.`,
          403
        );
      }
      
      next();
    } catch (error: any) {
      console.error('Erro na verificação de feature:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'FEATURE_NOT_AVAILABLE',
          upgrade_required: error.statusCode === 402 || error.statusCode === 403
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno na verificação de features'
      });
    }
  };
};

// Estender a interface Request para incluir informações do plano
declare global {
  namespace Express {
    interface Request {
      tenantPlan?: {
        name: string;
        slug: string;
        limits: Record<string, any>;
        features: Record<string, boolean>;
      };
    }
  }
}