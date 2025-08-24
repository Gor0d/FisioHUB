import { prisma } from '@/lib/prisma';
import { tenantPrisma } from '@/lib/tenantPrisma';
import { createError } from '@/middleware/errorHandler';
import bcrypt from 'bcryptjs';

interface CreateTenantData {
  name: string;
  slug: string;
  email: string;
  password: string;
  plan?: string;
  subdomain?: string;
  customDomain?: string;
}

interface TenantSeedData {
  clientName: string;
  hospitalName: string;
  adminName: string;
  adminEmail: string;
}

export class TenantService {
  /**
   * Criar um novo tenant completo
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
            status: 'trial', // Começar com trial
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
          }
        });
        
        // 3. Criar schema do tenant (SQLite não suporta schemas)
        // const schemaName = `tenant_${tenant.id.replace(/-/g, '_')}`;
        // await tenantPrisma.createTenantSchema(schemaName);
        
        // 4. Criar usuário global/admin
        const passwordHash = await bcrypt.hash(data.password, 10);
        
        const globalUser = await tx.globalUser.create({
          data: {
            email: data.email,
            password: passwordHash,
            name: data.name,
            tenantId: tenant.id
          }
        });
        
        // 5. GlobalUser já está associado ao tenant pelo relacionamento
        
        // 6. Criar assinatura de trial (simplificado por agora)
        // const basicPlan = await tx.subscriptionPlan.findFirst({
        //   where: { slug: data.plan || 'basic' }
        // });
        
        // if (basicPlan) {
        //   await tx.tenantSubscription.create({
        //     data: {
        //       tenantId: tenant.id,
        //       planId: basicPlan.id,
        //       status: 'trialing',
        //       currentPeriodStart: new Date(),
        //       currentPeriodEnd: tenant.trialEndsAt!
        //     }
        //   });
        // }
        
        // 7. Seed dados iniciais no schema do tenant (comentado por simplicidade)
        // await this.seedTenantData(schemaName, {
        //   clientName: data.name,
        //   hospitalName: `${data.name} - Principal`,
        //   adminName: data.name,
        //   adminEmail: data.email
        // });
        
        // 8. Configurações iniciais
        await tx.tenantSetting.createMany({
          data: [
            {
              tenantId: tenant.id,
              key: 'onboarding_completed',
              value: false
            },
            {
              tenantId: tenant.id,
              key: 'welcome_email_sent',
              value: false
            },
            {
              tenantId: tenant.id,
              key: 'default_features',
              value: {
                dashboard: true,
                indicators: true,
                reports: data.plan !== 'basic'
              }
            }
          ]
        });
        
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
  
  /**
   * Seed dados iniciais para um tenant
   */
  private async seedTenantData(schema: string, data: TenantSeedData) {
    try {
      await tenantPrisma.withTenant(schema, async (prisma) => {
        // 1. Criar cliente
        const client = await prisma.$executeRaw`
          INSERT INTO clients (name, contact_email, subscription_plan, active)
          VALUES (${data.clientName}, ${data.adminEmail}, 'enterprise', true)
          RETURNING id
        `;
        
        // Obter o ID do cliente criado
        const clientResult = await prisma.$queryRaw`
          SELECT id FROM clients WHERE contact_email = ${data.adminEmail} LIMIT 1
        ` as any[];
        
        if (clientResult.length === 0) {
          throw new Error('Falha ao criar cliente inicial');
        }
        
        const clientId = clientResult[0].id;
        
        // 2. Criar hospital principal
        const hospitalResult = await prisma.$queryRaw`
          INSERT INTO hospitals (client_id, name, code, active)
          VALUES (${clientId}, ${data.hospitalName}, 'principal', true)
          RETURNING id
        ` as any[];
        
        if (hospitalResult.length === 0) {
          throw new Error('Falha ao criar hospital inicial');
        }
        
        const hospitalId = hospitalResult[0].id;
        
        // 3. Criar serviços padrão
        const defaultServices = [
          {
            name: 'Fisioterapia',
            code: 'fisioterapia',
            color: '#10B981',
            icon: 'heart'
          },
          {
            name: 'Psicologia',
            code: 'psicologia', 
            color: '#3B82F6',
            icon: 'brain'
          },
          {
            name: 'Serviço Social',
            code: 'servico-social',
            color: '#F59E0B',
            icon: 'users'
          }
        ];
        
        for (const service of defaultServices) {
          await prisma.$executeRaw`
            INSERT INTO services (hospital_id, name, code, color, icon, active)
            VALUES (${hospitalId}, ${service.name}, ${service.code}, ${service.color}, ${service.icon}, true)
          `;
        }
        
        // 4. Criar usuário administrativo no schema do tenant
        await prisma.$executeRaw`
          INSERT INTO users (name, email, specialty, role, hospital_id, active)
          VALUES (${data.adminName}, ${data.adminEmail}, 'Administrador', 'admin', ${hospitalId}, true)
        `;
        
        console.log(`✅ Dados iniciais criados para schema: ${schema}`);
      });
    } catch (error) {
      console.error(`Erro ao criar dados iniciais para ${schema}:`, error);
      throw error;
    }
  }
  
  /**
   * Buscar tenant por slug
   */
  async findTenantBySlug(slug: string) {
    return await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { subdomain: slug }
        ]
      },
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        },
        settings: true
      }
    });
  }
  
  /**
   * Atualizar configurações do tenant
   */
  async updateTenantSettings(tenantId: string, settings: Record<string, any>) {
    const updates = Object.entries(settings).map(([key, value]) => ({
      tenantId,
      key,
      value: typeof value === 'object' ? value : { value }
    }));
    
    return await prisma.tenantSetting.createMany({
      data: updates,
      skipDuplicates: false // Permitir updates
    });
  }
  
  /**
   * Suspender tenant
   */
  async suspendTenant(tenantId: string, reason: string) {
    return await prisma.$transaction(async (tx) => {
      // Atualizar status
      await tx.tenant.update({
        where: { id: tenantId },
        data: { 
          status: 'suspended',
          updatedAt: new Date()
        }
      });
      
      // Registrar motivo
      await tx.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: 'suspension_reason'
          }
        },
        create: {
          tenantId,
          key: 'suspension_reason',
          value: { reason, date: new Date() }
        },
        update: {
          value: { reason, date: new Date() }
        }
      });
      
      console.log(`⛔ Tenant ${tenantId} suspenso: ${reason}`);
    });
  }
  
  /**
   * Reativar tenant
   */
  async reactivateTenant(tenantId: string) {
    return await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        status: 'active',
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Deletar tenant (CUIDADO!)
   */
  async deleteTenant(tenantId: string, confirm: boolean = false) {
    if (!confirm) {
      throw createError('Confirmação necessária para deletar tenant', 400);
    }
    
    return await prisma.$transaction(async (tx) => {
      // 1. Buscar tenant
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId }
      });
      
      if (!tenant) {
        throw createError('Tenant não encontrado', 404);
      }
      
      const schema = `tenant_${tenant.id.replace(/-/g, '_')}`;
      
      // 2. Deletar schema (irrecuperável!)
      await tenantPrisma.dropTenantSchema(schema);
      
      // 3. Deletar registros relacionados (cascade vai cuidar da maioria)
      await tx.tenant.delete({
        where: { id: tenantId }
      });
      
      console.log(`🗑️ Tenant ${tenant.name} deletado permanentemente`);
      
      return { deleted: true, tenant: tenant.name };
    });
  }
  
  /**
   * Listar todos os tenants (para super admin)
   */
  async listTenants(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        skip: offset,
        take: limit,
        include: {
          subscriptions: {
            where: { status: 'active' },
            include: { plan: true }
          },
          _count: {
            select: {
              tenantUsers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tenant.count()
    ]);
    
    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

// Singleton instance
export const tenantService = new TenantService();