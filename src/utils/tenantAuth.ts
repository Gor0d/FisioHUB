import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { tenantPrisma } from '@/lib/tenantPrisma';
import { createError } from '@/middleware/errorHandler';

interface TenantJWTPayload {
  userId: string;          // ID do usuário no schema do tenant
  globalUserId: string;    // ID do usuário global
  tenantId: string;        // ID do tenant
  tenantSlug: string;      // Slug do tenant para facilitar
  role: string;            // Papel do usuário no tenant
  permissions: string[];   // Permissões específicas
  hospitalId?: string;     // Hospital do usuário (se aplicável)
  serviceId?: string;      // Serviço do usuário (se aplicável)
}

interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

interface AuthResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    hospitalId?: string;
    serviceId?: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export class TenantAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`;
  
  /**
   * Autenticar usuário em um tenant específico
   */
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, tenantSlug } = credentials;
    
    try {
      // 1. Buscar tenant
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: tenantSlug },
            { subdomain: tenantSlug }
          ]
        },
        include: {
          subscriptions: {
            where: { status: { in: ['active', 'trialing'] } },
            include: { plan: true }
          }
        }
      });
      
      if (!tenant || tenant.status !== 'active') {
        throw createError('Tenant não encontrado ou inativo', 404);
      }
      
      // 2. Buscar usuário global
      const globalUser = await prisma.globalUser.findUnique({
        where: { email }
      });
      
      if (!globalUser) {
        throw createError('Credenciais inválidas', 401);
      }
      
      // 3. Verificar senha
      const passwordValid = await bcrypt.compare(password, globalUser.passwordHash);
      if (!passwordValid) {
        throw createError('Credenciais inválidas', 401);
      }
      
      // 4. Verificar acesso ao tenant
      const tenantUser = await prisma.tenantUser.findUnique({
        where: {
          tenantId_globalUserId: {
            tenantId: tenant.id,
            globalUserId: globalUser.id
          }
        }
      });
      
      if (!tenantUser || tenantUser.status !== 'active') {
        throw createError('Acesso negado a este tenant', 403);
      }
      
      // 5. Buscar dados do usuário no schema do tenant
      const schema = `tenant_${tenant.id.replace(/-/g, '_')}`;
      
      const tenantUserData = await tenantPrisma.withTenant(schema, async (prisma) => {
        return await prisma.$queryRaw`
          SELECT 
            u.id,
            u.name,
            u.email,
            u.specialty,
            u.role,
            u.hospital_id,
            u.service_id,
            h.name as hospital_name,
            s.name as service_name
          FROM users u
          LEFT JOIN hospitals h ON u.hospital_id = h.id
          LEFT JOIN services s ON u.service_id = s.id
          WHERE u.email = ${email}
          AND u.active = true
          LIMIT 1
        ` as any[];
      });
      
      if (tenantUserData.length === 0) {
        throw createError('Usuário não encontrado no tenant', 404);
      }
      
      const userData = tenantUserData[0];
      
      // 6. Determinar permissões baseadas no role
      const permissions = this.getPermissionsForRole(tenantUser.role);
      
      // 7. Gerar tokens
      const tokenPayload: TenantJWTPayload = {
        userId: userData.id,
        globalUserId: globalUser.id,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: tenantUser.role,
        permissions,
        hospitalId: userData.hospital_id,
        serviceId: userData.service_id
      };
      
      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);
      
      // 8. Atualizar último acesso
      await prisma.tenantUser.update({
        where: {
          tenantId_globalUserId: {
            tenantId: tenant.id,
            globalUserId: globalUser.id
          }
        },
        data: { lastAccessAt: new Date() }
      });
      
      return {
        token,
        refreshToken,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: tenantUser.role,
          hospitalId: userData.hospital_id,
          serviceId: userData.service_id
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.subscriptions[0]?.plan.slug || 'basic'
        }
      };
      
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }
  
  /**
   * Gerar token JWT
   */
  generateToken(payload: TenantJWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'fisiohub-saas',
      audience: payload.tenantSlug
    });
  }
  
  /**
   * Gerar refresh token
   */
  generateRefreshToken(payload: TenantJWTPayload): string {
    return jwt.sign(
      { 
        globalUserId: payload.globalUserId,
        tenantId: payload.tenantId 
      }, 
      this.JWT_REFRESH_SECRET, 
      {
        expiresIn: '7d',
        issuer: 'fisiohub-saas-refresh',
        audience: payload.tenantSlug
      }
    );
  }
  
  /**
   * Verificar e decodificar token
   */
  verifyToken(token: string, tenantSlug?: string): TenantJWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'fisiohub-saas',
        ...(tenantSlug && { audience: tenantSlug })
      }) as TenantJWTPayload;
      
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw createError('Token expirado', 401);
      } else if (error.name === 'JsonWebTokenError') {
        throw createError('Token inválido', 401);
      } else {
        throw createError('Erro na verificação do token', 401);
      }
    }
  }
  
  /**
   * Renovar token usando refresh token
   */
  async refreshToken(refreshToken: string, tenantSlug: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, {
        issuer: 'fisiohub-saas-refresh',
        audience: tenantSlug
      }) as any;
      
      // Buscar dados atuais do usuário
      const tenantUser = await prisma.tenantUser.findFirst({
        where: {
          tenantId: decoded.tenantId,
          globalUserId: decoded.globalUserId,
          status: 'active'
        },
        include: {
          tenant: true,
          globalUser: true
        }
      });
      
      if (!tenantUser) {
        throw createError('Usuário ou tenant inválido', 401);
      }
      
      // Buscar dados no schema do tenant
      const schema = `tenant_${tenantUser.tenantId.replace(/-/g, '_')}`;
      
      const tenantUserData = await tenantPrisma.withTenant(schema, async (prisma) => {
        return await prisma.$queryRaw`
          SELECT id, hospital_id, service_id
          FROM users
          WHERE email = ${tenantUser.globalUser.email}
          AND active = true
          LIMIT 1
        ` as any[];
      });
      
      if (tenantUserData.length === 0) {
        throw createError('Usuário não encontrado', 401);
      }
      
      const userData = tenantUserData[0];
      
      // Gerar novos tokens
      const newTokenPayload: TenantJWTPayload = {
        userId: userData.id,
        globalUserId: tenantUser.globalUserId,
        tenantId: tenantUser.tenantId,
        tenantSlug: tenantUser.tenant.slug,
        role: tenantUser.role,
        permissions: this.getPermissionsForRole(tenantUser.role),
        hospitalId: userData.hospital_id,
        serviceId: userData.service_id
      };
      
      return {
        token: this.generateToken(newTokenPayload),
        refreshToken: this.generateRefreshToken(newTokenPayload)
      };
      
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      throw createError('Refresh token inválido', 401);
    }
  }
  
  /**
   * Determinar permissões baseadas no papel do usuário
   */
  private getPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      tenant_admin: [
        'tenant:manage',
        'hospitals:*',
        'services:*',
        'users:*',
        'patients:*',
        'indicators:*',
        'reports:*',
        'settings:*'
      ],
      hospital_admin: [
        'hospitals:read',
        'hospitals:update',
        'services:*',
        'users:create',
        'users:read',
        'users:update',
        'patients:*',
        'indicators:*',
        'reports:read'
      ],
      service_manager: [
        'services:read',
        'users:read',
        'patients:*',
        'indicators:*',
        'reports:read'
      ],
      collaborator: [
        'patients:read',
        'patients:create',
        'patients:update',
        'indicators:create',
        'indicators:read',
        'indicators:update'
      ]
    };
    
    return rolePermissions[role] || ['read'];
  }
  
  /**
   * Verificar se usuário tem permissão específica
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Verificar permissão exata
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }
    
    // Verificar wildcard (ex: users:* inclui users:read)
    const [resource, action] = requiredPermission.split(':');
    const wildcardPermission = `${resource}:*`;
    
    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }
    
    // Super permissão (tenant:manage inclui tudo)
    if (userPermissions.includes('tenant:manage')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Middleware helper para verificar permissões
   */
  requirePermission(permission: string) {
    return (userPermissions: string[]) => {
      if (!this.hasPermission(userPermissions, permission)) {
        throw createError(`Permissão '${permission}' necessária`, 403);
      }
    };
  }
}

// Singleton instance
export const tenantAuth = new TenantAuthService();