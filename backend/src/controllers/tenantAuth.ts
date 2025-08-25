import { Request, Response } from 'express';
import { z } from 'zod';
import { tenantAuth } from '@/utils/tenantAuth';
import { TenantService } from '@/services/tenantService';

const tenantService = new TenantService();
import { createError } from '@/middleware/errorHandler';

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  tenantSlug: z.string().min(1, 'Tenant é obrigatório')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
  tenantSlug: z.string().min(1, 'Tenant é obrigatório')
});

const createTenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  subdomain: z.string().optional(),
  plan: z.enum(['basic', 'professional', 'enterprise']).default('basic'),
  customDomain: z.string().optional()
});

/**
 * POST /api/auth/login
 * Autenticar usuário em um tenant
 */
export const loginTenant = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const authResult = await tenantAuth.authenticateUser(validatedData);
    
    // Log da autenticação bem-sucedida
    console.log(`✅ Login: ${authResult.user.email} em ${authResult.tenant.name} (${authResult.tenant.slug})`);
    
    res.json({
      success: true,
      message: 'Autenticado com sucesso',
      data: authResult
    });
    
  } catch (error: any) {
    console.error('Erro no login:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/auth/refresh
 * Renovar token de acesso
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    
    const tokens = await tenantAuth.refreshToken(
      validatedData.refreshToken,
      validatedData.tenantSlug
    );
    
    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: tokens
    });
    
  } catch (error: any) {
    console.error('Erro na renovação de token:', error);
    
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
    
    res.status(401).json({
      success: false,
      message: 'Erro na renovação do token'
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout (no servidor é apenas informativo, o cliente deve descartar os tokens)
 */
export const logoutTenant = async (req: Request, res: Response) => {
  try {
    // Aqui poderia invalidar o token no Redis/cache se tivéssemos
    // Por enquanto, apenas retorna sucesso
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro no logout:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/tenants/register
 * Cadastrar novo tenant (público)
 */
export const registerTenant = async (req: Request, res: Response) => {
  try {
    console.log('registerTenant called with body:', JSON.stringify(req.body, null, 2));
    
    const validatedData = createTenantSchema.parse(req.body);
    
    // Criar tenant completo
    const result = await tenantService.createTenant(validatedData);
    
    console.log(`✅ Novo tenant criado: ${result.tenant.name} (${result.tenant.slug})`);
    
    res.status(201).json({
      success: true,
      message: 'Tenant criado com sucesso! Verifique seu email para ativar a conta.',
      data: {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          status: result.tenant.status,
          plan: result.tenant.plan,
          trialEndsAt: result.tenant.trialEndsAt
        }
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao criar tenant:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
    
    // Erro específico de tenant duplicado
    if (error.code === 'P2002' || error.message.includes('já existe')) {
      return res.status(409).json({
        success: false,
        message: 'Slug ou email já está em uso',
        code: 'DUPLICATE_TENANT'
      });
    }
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/tenants/:slug/info
 * Obter informações públicas do tenant
 */
export const getTenantInfo = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    console.log('getTenantInfo called with slug:', slug);
    
    const tenant = await tenantService.findTenantBySlug(slug);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
        createdAt: tenant.createdAt
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar info do tenant:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado (protegida)
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Esta rota deve ser protegida pelos middlewares de autenticação
    const user = (req as any).user;
    const tenant = (req as any).tenant;
    
    if (!user || !tenant) {
      throw createError('Dados de autenticação não encontrados', 401);
    }
    
    res.json({
      success: true,
      data: {
        user,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan
        }
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao obter usuário atual:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/auth/validate
 * Validar token sem renovar (útil para verificações rápidas)
 */
export const validateToken = async (req: Request, res: Response) => {
  try {
    const { token, tenantSlug } = req.body;
    
    if (!token || !tenantSlug) {
      throw createError('Token e tenantSlug são obrigatórios', 400);
    }
    
    const payload = tenantAuth.verifyToken(token, tenantSlug);
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        valid: true,
        userId: payload.userId,
        role: payload.role,
        permissions: payload.permissions,
        expiresAt: new Date(payload.exp! * 1000) // Convert unix timestamp to Date
      }
    });
    
  } catch (error: any) {
    console.error('Erro na validação de token:', error);
    
    res.json({
      success: true,
      data: {
        valid: false,
        error: error.message
      }
    });
  }
};