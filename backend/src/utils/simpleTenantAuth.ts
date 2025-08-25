import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';

interface SimpleTenantJWTPayload {
  userId: string;          // GlobalUser ID
  tenantId: string;        // Tenant ID
  tenantSlug: string;      // Tenant slug
  role: string;            // User role
  email: string;           // User email
}

interface SimpleLoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

interface SimpleAuthResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export class SimpleTenantAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  
  /**
   * Authenticate user with simple schema
   */
  async authenticateUser(credentials: SimpleLoginCredentials): Promise<SimpleAuthResult> {
    const { email, password, tenantSlug } = credentials;
    
    try {
      console.log(`🔐 Tentativa de login: ${email} em ${tenantSlug}`);
      
      // 1. Find tenant by slug or subdomain
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: tenantSlug },
            { subdomain: tenantSlug }
          ],
          status: { in: ['trial', 'active'] }, // Accept both trial and active
          isActive: true
        }
      });
      
      if (!tenant) {
        console.log(`❌ Tenant não encontrado: ${tenantSlug}`);
        throw createError('Tenant não encontrado ou inativo', 404);
      }
      
      console.log(`✅ Tenant encontrado: ${tenant.name} (${tenant.slug})`);
      
      // 2. Find user associated with this tenant
      const user = await prisma.globalUser.findFirst({
        where: {
          email: email,
          tenantId: tenant.id,
          isActive: true
        }
      });
      
      if (!user) {
        console.log(`❌ Usuário não encontrado: ${email} no tenant ${tenant.slug}`);
        throw createError('Credenciais inválidas', 401);
      }
      
      console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
      
      // 3. Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        console.log(`❌ Senha inválida para: ${email}`);
        throw createError('Credenciais inválidas', 401);
      }
      
      console.log(`✅ Senha válida para: ${email}`);
      
      // 4. Generate tokens
      const tokenPayload: SimpleTenantJWTPayload = {
        userId: user.id,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: user.role,
        email: user.email
      };
      
      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);
      
      // 5. Update last login
      await prisma.globalUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      console.log(`✅ Login bem-sucedido: ${user.email} em ${tenant.name}`);
      
      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan
        }
      };
      
    } catch (error: any) {
      console.error('❌ Erro na autenticação:', error.message);
      throw error;
    }
  }
  
  /**
   * Generate JWT token
   */
  generateToken(payload: SimpleTenantJWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'fisiohub-saas',
      audience: payload.tenantSlug
    });
  }
  
  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: SimpleTenantJWTPayload): string {
    return jwt.sign(
      { 
        userId: payload.userId,
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
   * Verify and decode token
   */
  verifyToken(token: string, tenantSlug?: string): SimpleTenantJWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'fisiohub-saas',
        ...(tenantSlug && { audience: tenantSlug })
      }) as SimpleTenantJWTPayload;
      
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
   * Refresh token
   */
  async refreshToken(refreshToken: string, tenantSlug: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET, {
        issuer: 'fisiohub-saas-refresh',
        audience: tenantSlug
      }) as any;
      
      // Get current user data
      const user = await prisma.globalUser.findFirst({
        where: {
          id: decoded.userId,
          tenantId: decoded.tenantId,
          isActive: true
        },
        include: {
          tenant: true
        }
      });
      
      if (!user || !user.tenant) {
        throw createError('Usuário ou tenant inválido', 401);
      }
      
      // Generate new tokens
      const newTokenPayload: SimpleTenantJWTPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        tenantSlug: user.tenant.slug,
        role: user.role,
        email: user.email
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
}

// Singleton instance
export const simpleTenantAuth = new SimpleTenantAuthService();