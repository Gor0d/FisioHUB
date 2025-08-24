import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  schema: string;
  status: string;
  plan: string;
}

export interface TenantRequest extends Request {
  tenant?: TenantInfo;
}

/**
 * Middleware para resolver o tenant baseado em diferentes fontes
 */
export const tenantResolver = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantSlug: string | null = null;
    
    // 1. Via subdomain (cliente.fisiohub.com)
    const host = req.headers.host;
    if (host) {
      const parts = host.split('.');
      // Se tem 3+ partes e não é 'www', usar como tenant
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api') {
        tenantSlug = parts[0];
      }
    }
    
    // 2. Via header customizado (para APIs)
    if (!tenantSlug) {
      tenantSlug = req.headers['x-tenant-slug'] as string;
    }
    
    // 3. Via query parameter (para desenvolvimento/testes)
    if (!tenantSlug && req.query.tenant) {
      tenantSlug = req.query.tenant as string;
    }
    
    // 4. Via path parameter (rotas específicas)
    if (!tenantSlug && req.params.tenantSlug) {
      tenantSlug = req.params.tenantSlug;
    }
    
    if (!tenantSlug) {
      throw createError(
        'Tenant não identificado. Use subdomínio, header X-Tenant-Slug ou parâmetro tenant.', 
        400
      );
    }
    
    // Buscar tenant no banco de dados público
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: tenantSlug },
          { subdomain: tenantSlug }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        plan: true,
        lastActivityAt: true
      }
    });
    
    if (!tenant) {
      throw createError(`Tenant '${tenantSlug}' não encontrado`, 404);
    }
    
    if (tenant.status !== 'active') {
      throw createError(
        `Tenant '${tenantSlug}' está ${tenant.status}. Entre em contato com o suporte.`, 
        403
      );
    }
    
    // Atualizar última atividade (de forma assíncrona para não bloquear)
    prisma.tenant.update({
      where: { id: tenant.id },
      data: { lastActivityAt: new Date() }
    }).catch(console.error);
    
    // Adicionar informações do tenant na request
    req.tenant = {
      ...tenant,
      schema: `tenant_${tenant.id.replace(/-/g, '_')}`
    };
    
    next();
  } catch (error: any) {
    console.error('Erro no tenant resolver:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: 'TENANT_RESOLUTION_ERROR'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware opcional - permite requisições sem tenant
 * Útil para rotas que podem funcionar com ou sem tenant
 */
export const optionalTenantResolver = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await tenantResolver(req, res, () => {
      // Se chegou aqui, tenant foi resolvido com sucesso
      next();
    });
  } catch (error) {
    // Se falhou, continua sem tenant
    console.log('Tenant resolver falhou, continuando sem tenant context');
    next();
  }
};

/**
 * Helper para obter informações do tenant da request
 */
export const getTenantFromRequest = (req: Request): TenantInfo => {
  const tenantReq = req as TenantRequest;
  
  if (!tenantReq.tenant) {
    throw createError('Contexto de tenant não encontrado', 400);
  }
  
  return tenantReq.tenant;
};

/**
 * Middleware para validar se o tenant tem permissão para uma funcionalidade
 */
export const validateTenantFeature = (feature: string) => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) {
        throw createError('Contexto de tenant necessário', 400);
      }
      
      // Buscar configurações do tenant
      const subscription = await prisma.tenantSubscription.findFirst({
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
      console.error('Erro na validação de feature:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'FEATURE_NOT_AVAILABLE'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  };
};