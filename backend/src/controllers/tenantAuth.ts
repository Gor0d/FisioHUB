import { Request, Response } from 'express';
import { z } from 'zod';
import { tenantAuth } from '@/utils/tenantAuth';
import { simpleTenantAuth } from '@/utils/simpleTenantAuth';
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
    console.log('=== LOGIN TENANT START ===');
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    
    const validatedData = loginSchema.parse(req.body);
    
    // Use simplified auth system that matches our current schema
    const authResult = await simpleTenantAuth.authenticateUser(validatedData);
    
    // Log da autenticação bem-sucedida
    console.log(`✅ Login: ${authResult.user.email} em ${authResult.tenant.name} (${authResult.tenant.slug})`);
    
    res.json({
      success: true,
      message: 'Autenticado com sucesso',
      data: authResult
    });
    
  } catch (error: any) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    
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
    
    // Use simplified auth system
    const tokens = await simpleTenantAuth.refreshToken(
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
    console.log('=== REGISTER TENANT START ===');
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    
    const validatedData = createTenantSchema.parse(req.body);
    const { name, slug, email, password } = validatedData;
    
    // Import required modules
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcryptjs');
    
    // Check if slug is already taken
    const existingTenant = await prisma.tenant.findFirst({
      where: { slug }
    });
    
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Este identificador já está em uso',
        code: 'DUPLICATE_SLUG'
      });
    }
    
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        email,
        status: 'trial',
        plan: 'basic',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Hash password and create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await prisma.globalUser.create({
      data: {
        email,
        name: `Admin ${name}`,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant.id
      }
    });
    
    console.log(`✅ Tenant criado: ${tenant.name} (${tenant.slug})`);
    console.log(`✅ Admin criado: ${adminUser.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Tenant criado com sucesso!',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan,
          trialEndsAt: tenant.trialEndsAt
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name
        }
      }
    });
    
  } catch (error: any) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error details:', error);
    
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
    console.log('=== GET TENANT INFO START ===');
    console.log('Slug requested:', slug);
    
    const { prisma } = require('@/lib/prisma');
    
    // Check if this is being called from success page (after registration)
    const referer = req.headers.referer;
    const isFromSuccessPage = referer && referer.includes('/register/success');
    
    if (isFromSuccessPage) {
      // Try to return real tenant data for success page
      const tenant = await prisma.tenant.findFirst({
        where: { slug }
      });
      
      if (tenant) {
        console.log('Returning real tenant data for success page');
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
      } else {
        // Fallback to mock data if tenant not found
        console.log('Returning mock data for success page (tenant not found)');
        res.json({
          success: true,
          data: {
            id: 'success-' + Date.now(),
            name: `Tenant ${slug}`,
            slug: slug,
            status: 'trial',
            plan: 'basic',
            createdAt: new Date().toISOString()
          }
        });
      }
    } else {
      // For slug availability checks, actually check if tenant exists
      const tenant = await prisma.tenant.findFirst({
        where: { slug }
      });
      
      if (tenant) {
        console.log('Slug already exists, returning 409');
        res.status(409).json({
          success: false,
          message: 'Este identificador já está em uso'
        });
      } else {
        console.log('Slug available, returning 404');
        res.status(404).json({
          success: false,
          message: 'Tenant não encontrado'
        });
      }
    }
    
  } catch (error: any) {
    console.error('=== GET TENANT INFO ERROR ===');
    console.error('Error details:', error);
    
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
    
    // Use simplified auth system
    const payload = simpleTenantAuth.verifyToken(token, tenantSlug);
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        valid: true,
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
        tenantId: payload.tenantId,
        tenantSlug: payload.tenantSlug
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