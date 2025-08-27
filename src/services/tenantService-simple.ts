import { prisma } from '@/lib/prisma';
import { createError } from '@/middleware/errorHandler';
import bcrypt from 'bcrypt';

export interface CreateTenantData {
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  email: string;
  password: string;
  plan?: string;
}

export class TenantService {
  /**
   * Buscar tenant por slug
   */
  async findTenantBySlug(slug: string) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { subdomain: slug }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        status: true,
        plan: true,
        email: true,
        createdAt: true
      }
    });

    return tenant;
  }

  /**
   * Criar um novo tenant completo (versão simplificada)
   */
  async createTenant(data: CreateTenantData) {
    return await prisma.$transaction(async (tx) => {
      try {
        // 1. Validar se slug não existe
        const existingTenant = await tx.tenant.findFirst({
          where: {
            OR: [
              { slug: data.slug },
              { subdomain: data.subdomain }
            ]
          }
        });
        
        if (existingTenant) {
          throw createError('Slug ou subdomínio já existe', 400);
        }
        
        // 2. Criar tenant
        const tenant = await tx.tenant.create({
          data: {
            name: data.name,
            slug: data.slug,
            subdomain: data.subdomain,
            customDomain: data.customDomain,
            email: data.email,
            plan: data.plan || 'basic',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
          }
        });
        
        // 3. Verificar se usuário já existe ou criar novo
        const passwordHash = await bcrypt.hash(data.password, 10);
        
        let globalUser = await tx.globalUser.findUnique({
          where: { email: data.email }
        });

        if (!globalUser) {
          globalUser = await tx.globalUser.create({
            data: {
              email: data.email,
              password: passwordHash,
              name: data.name,
              tenantId: tenant.id
            }
          });
        }
        
        console.log(`✅ Tenant criado: ${tenant.name} (${tenant.slug})`);
        
        return {
          tenant,
          globalUser: { id: globalUser.id, email: globalUser.email },
          schema: `tenant_${tenant.id.replace(/-/g, '_')}`
        };
        
      } catch (error) {
        console.error('Erro ao criar tenant:', error);
        throw error;
      }
    });
  }
}

export const tenantService = new TenantService();