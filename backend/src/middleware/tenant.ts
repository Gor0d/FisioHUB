import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { createError } from './errorHandler';

export interface TenantRequest extends Request {
  hospital?: {
    id: string;
    subdomain: string;
    name: string;
    active: boolean;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    hospitalId: string;
  };
}

/**
 * Middleware para identificar o tenant (hospital) baseado no subdomínio
 */
export const tenantMiddleware = async (
  req: TenantRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Extrair subdomínio do host
    const host = req.get('host') || '';
    const subdomain = extractSubdomain(host);
    
    if (!subdomain) {
      throw createError('Subdomínio não identificado', 400);
    }

    // Buscar hospital pelo subdomínio
    const hospital = await prisma.hospital.findUnique({
      where: { 
        subdomain,
        active: true 
      },
      select: {
        id: true,
        subdomain: true,
        name: true,
        active: true,
        maxUsers: true,
        subscriptionPlan: true
      }
    });

    if (!hospital) {
      throw createError('Hospital não encontrado ou inativo', 404);
    }

    // Adicionar hospital ao request
    req.hospital = hospital;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para garantir que operações sejam isoladas por tenant
 * Deve ser usado após tenantMiddleware e authMiddleware
 */
export const tenantIsolationMiddleware = (
  req: TenantRequest, 
  res: Response, 
  next: NextFunction
): void => {
  // Verificar se usuário pertence ao hospital
  if (req.user && req.hospital && req.user.hospitalId !== req.hospital.id) {
    throw createError('Acesso negado - usuário não pertence a este hospital', 403);
  }

  next();
};

/**
 * Extrai subdomínio do host
 * Exemplos:
 * - hospital1.fisiohub.com.br → hospital1
 * - localhost:3000 → null (desenvolvimento)
 * - app.fisiohub.com.br → app
 */
function extractSubdomain(host: string): string | null {
  // Remover porta se existir
  const hostname = host.split(':')[0];
  
  // Em desenvolvimento (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Dividir por pontos
  const parts = hostname.split('.');
  
  // Se tem pelo menos 3 partes (subdomain.domain.tld)
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

/**
 * Helper para criar queries isoladas por tenant
 */
export const createTenantQuery = (hospitalId: string, additionalWhere: any = {}) => {
  return {
    ...additionalWhere,
    hospitalId
  };
};

/**
 * Decorator para controllers que precisam de isolamento
 */
export const withTenantIsolation = (controllerFn: Function) => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      // Verificar se hospital está definido
      if (!req.hospital) {
        throw createError('Contexto de hospital não encontrado', 400);
      }
      
      // Executar controller original
      return await controllerFn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Utilitário para verificar limites do plano
 */
export const checkSubscriptionLimits = async (hospitalId: string, resource: 'users' | 'patients'): Promise<boolean> => {
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: { 
      maxUsers: true, 
      subscriptionPlan: true,
      _count: {
        select: {
          users: true,
          patients: true
        }
      }
    }
  });

  if (!hospital) return false;

  switch (resource) {
    case 'users':
      return hospital._count.users < hospital.maxUsers;
    case 'patients':
      const maxPatients = getMaxPatientsByPlan(hospital.subscriptionPlan);
      return hospital._count.patients < maxPatients;
    default:
      return false;
  }
};

/**
 * Retorna limite de pacientes por plano
 */
function getMaxPatientsByPlan(plan: string): number {
  switch (plan) {
    case 'basic': return 100;
    case 'professional': return 500;
    case 'enterprise': return 999999; // Ilimitado
    default: return 100;
  }
}