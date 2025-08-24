import { Response, NextFunction } from 'express';
import { TenantRequest } from '@/middleware/tenantResolver';
import { tenantAuth } from '@/utils/tenantAuth';
import { createError } from '@/middleware/errorHandler';

export interface TenantAuthRequest extends TenantRequest {
  user?: {
    id: string;
    globalUserId: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    hospitalId?: string;
    serviceId?: string;
  };
}

/**
 * Middleware de autenticação multi-tenant
 * Deve ser usado APÓS tenantResolver
 */
export const tenantAuthMiddleware = async (
  req: TenantAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.tenant) {
      throw createError('Contexto de tenant necessário. Use tenantResolver primeiro.', 400);
    }
    
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de autorização necessário', 401);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verificar e decodificar token
    const payload = tenantAuth.verifyToken(token, req.tenant.slug);
    
    // Validar se o token é para este tenant
    if (payload.tenantId !== req.tenant.id) {
      throw createError('Token inválido para este tenant', 403);
    }
    
    // Adicionar informações do usuário na request
    req.user = {
      id: payload.userId,
      globalUserId: payload.globalUserId,
      name: '', // Será preenchido se necessário
      email: '', // Será preenchido se necessário
      role: payload.role,
      permissions: payload.permissions,
      hospitalId: payload.hospitalId,
      serviceId: payload.serviceId
    };
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [${req.method}] ${req.path} - User: ${payload.userId} (Role: ${payload.role})`);
    }
    
    next();
  } catch (error: any) {
    console.error('Erro na autenticação multi-tenant:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: 'AUTHENTICATION_ERROR'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Erro na autenticação',
      code: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (permission: string) => {
  return (req: TenantAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401);
      }
      
      if (!tenantAuth.hasPermission(req.user.permissions, permission)) {
        throw createError(
          `Permissão '${permission}' necessária para acessar este recurso`,
          403
        );
      }
      
      next();
    } catch (error: any) {
      console.error('Erro na verificação de permissão:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'PERMISSION_ERROR',
          required_permission: permission
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Erro na verificação de permissões'
      });
    }
  };
};

/**
 * Middleware para verificar múltiplas permissões (OR logic)
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: TenantAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401);
      }
      
      const hasAnyPermission = permissions.some(permission =>
        tenantAuth.hasPermission(req.user!.permissions, permission)
      );
      
      if (!hasAnyPermission) {
        throw createError(
          `Uma das seguintes permissões é necessária: ${permissions.join(', ')}`,
          403
        );
      }
      
      next();
    } catch (error: any) {
      console.error('Erro na verificação de permissões:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'PERMISSION_ERROR',
          required_permissions: permissions
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Erro na verificação de permissões'
      });
    }
  };
};

/**
 * Middleware para verificar papel/role específico
 */
export const requireRole = (role: string | string[]) => {
  return (req: TenantAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401);
      }
      
      const allowedRoles = Array.isArray(role) ? role : [role];
      
      if (!allowedRoles.includes(req.user.role)) {
        throw createError(
          `Papel necessário: ${allowedRoles.join(' ou ')}`,
          403
        );
      }
      
      next();
    } catch (error: any) {
      console.error('Erro na verificação de papel:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'ROLE_ERROR',
          required_roles: Array.isArray(role) ? role : [role]
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Erro na verificação de papéis'
      });
    }
  };
};

/**
 * Middleware para verificar se usuário pertence a um hospital específico
 */
export const requireHospitalAccess = (hospitalIdParam: string = 'hospitalId') => {
  return (req: TenantAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401);
      }
      
      const requestedHospitalId = req.params[hospitalIdParam];
      
      if (!requestedHospitalId) {
        throw createError(`Parâmetro ${hospitalIdParam} necessário`, 400);
      }
      
      // Tenant admin e hospital admin do hospital podem acessar
      if (req.user.role === 'tenant_admin') {
        return next();
      }
      
      if (req.user.role === 'hospital_admin' && req.user.hospitalId === requestedHospitalId) {
        return next();
      }
      
      // Service manager e collaborator apenas do seu hospital
      if (req.user.hospitalId === requestedHospitalId) {
        return next();
      }
      
      throw createError('Acesso negado a este hospital', 403);
      
    } catch (error: any) {
      console.error('Erro na verificação de acesso ao hospital:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'HOSPITAL_ACCESS_ERROR'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Erro na verificação de acesso ao hospital'
      });
    }
  };
};

/**
 * Middleware para verificar se usuário pertence a um serviço específico
 */
export const requireServiceAccess = (serviceIdParam: string = 'serviceId') => {
  return (req: TenantAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401);
      }
      
      const requestedServiceId = req.params[serviceIdParam];
      
      if (!requestedServiceId) {
        throw createError(`Parâmetro ${serviceIdParam} necessário`, 400);
      }
      
      // Tenant admin, hospital admin e service manager podem acessar
      if (['tenant_admin', 'hospital_admin', 'service_manager'].includes(req.user.role)) {
        return next();
      }
      
      // Collaborator apenas do seu serviço
      if (req.user.serviceId === requestedServiceId) {
        return next();
      }
      
      throw createError('Acesso negado a este serviço', 403);
      
    } catch (error: any) {
      console.error('Erro na verificação de acesso ao serviço:', error);
      
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: 'SERVICE_ACCESS_ERROR'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Erro na verificação de acesso ao serviço'
      });
    }
  };
};

/**
 * Middleware opcional de autenticação (para rotas públicas com autenticação opcional)
 */
export const optionalTenantAuth = async (
  req: TenantAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await tenantAuthMiddleware(req, res, () => {
      // Se chegou aqui, usuário está autenticado
      next();
    });
  } catch (error) {
    // Se falhou na autenticação, continua sem usuário
    console.log('Autenticação opcional falhou, continuando sem usuário');
    next();
  }
};