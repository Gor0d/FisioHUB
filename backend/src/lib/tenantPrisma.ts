import { PrismaClient } from '@prisma/client';
import { TenantRequest } from '@/middleware/tenantResolver';
import { createError } from '@/middleware/errorHandler';

/**
 * Extended Prisma Client com suporte a multitenancy
 */
class TenantPrismaClient extends PrismaClient {
  private currentSchema?: string;
  
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
  }
  
  /**
   * Define o schema atual para as próximas operações
   */
  async setSchema(schema: string): Promise<void> {
    this.currentSchema = schema;
    await this.$executeRaw`SET search_path TO ${schema}, public`;
  }
  
  /**
   * Executa uma operação dentro do contexto de um tenant específico
   */
  async withTenant<T>(
    schema: string, 
    operation: (prisma: TenantPrismaClient) => Promise<T>
  ): Promise<T> {
    const previousSchema = this.currentSchema;
    
    try {
      await this.setSchema(schema);
      return await operation(this);
    } finally {
      // Restaurar schema anterior ou resetar para public
      if (previousSchema) {
        await this.setSchema(previousSchema);
      } else {
        await this.$executeRaw`SET search_path TO public`;
        this.currentSchema = undefined;
      }
    }
  }
  
  /**
   * Executa uma transação dentro do contexto de um tenant
   */
  async tenantTransaction<T>(
    schema: string,
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    return await this.withTenant(schema, async (prisma) => {
      return await prisma.$transaction(operation);
    });
  }
  
  /**
   * Verifica se um schema de tenant existe
   */
  async schemaExists(schema: string): Promise<boolean> {
    try {
      const result = await this.$queryRaw`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = ${schema}
      ` as any[];
      
      return result.length > 0;
    } catch (error) {
      console.error('Erro ao verificar existência do schema:', error);
      return false;
    }
  }
  
  /**
   * Cria um schema para um novo tenant
   */
  async createTenantSchema(schema: string): Promise<void> {
    try {
      // Criar schema
      await this.$executeRaw`CREATE SCHEMA IF NOT EXISTS ${schema}`;
      
      // Executar migrações específicas do tenant
      await this.runTenantMigrations(schema);
    } catch (error) {
      console.error(`Erro ao criar schema ${schema}:`, error);
      throw error;
    }
  }
  
  /**
   * Executa as migrações necessárias para um tenant
   * (Cria todas as tabelas necessárias no schema do tenant)
   */
  private async runTenantMigrations(schema: string): Promise<void> {
    await this.setSchema(schema);
    
    // SQL para criar todas as tabelas do tenant
    // Esta seria a migração automática baseada no schema Prisma
    const tenantTables = `
      -- Clients table
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        cnpj TEXT UNIQUE,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        subscription_plan TEXT DEFAULT 'enterprise',
        max_hospitals INTEGER DEFAULT 5,
        max_users INTEGER DEFAULT 100,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Hospitals table
      CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        address JSONB,
        contact_info JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(code, client_id)
      );
      
      -- Services table
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#10B981',
        icon TEXT DEFAULT 'stethoscope',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(code, hospital_id)
      );
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        global_user_id TEXT, -- Reference to public.global_users
        hospital_id TEXT REFERENCES hospitals(id),
        service_id TEXT REFERENCES services(id),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        specialty TEXT,
        role TEXT DEFAULT 'collaborator',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Patients table
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        hospital_id TEXT REFERENCES hospitals(id),
        service_id TEXT REFERENCES services(id),
        user_id TEXT REFERENCES users(id),
        name TEXT NOT NULL,
        birth_date DATE,
        phone TEXT,
        email TEXT,
        address JSONB,
        medical_record TEXT,
        admission_date TIMESTAMP,
        discharge_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Indicators table
      CREATE TABLE IF NOT EXISTS indicators (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        hospital_id TEXT REFERENCES hospitals(id),
        service_id TEXT REFERENCES services(id),
        user_id TEXT REFERENCES users(id),
        patient_id TEXT REFERENCES patients(id),
        name TEXT NOT NULL,
        value JSONB NOT NULL,
        unit TEXT,
        date TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Barthel Scales table
      CREATE TABLE IF NOT EXISTS barthel_scales (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        hospital_id TEXT REFERENCES hospitals(id),
        service_id TEXT REFERENCES services(id),
        user_id TEXT REFERENCES users(id),
        patient_id TEXT REFERENCES patients(id),
        evaluation_date TIMESTAMP NOT NULL,
        feeding INTEGER CHECK (feeding >= 0 AND feeding <= 10),
        bathing INTEGER CHECK (bathing >= 0 AND bathing <= 5),
        grooming INTEGER CHECK (grooming >= 0 AND grooming <= 5),
        dressing INTEGER CHECK (dressing >= 0 AND dressing <= 10),
        bowels INTEGER CHECK (bowels >= 0 AND bowels <= 10),
        bladder INTEGER CHECK (bladder >= 0 AND bladder <= 10),
        toilet_use INTEGER CHECK (toilet_use >= 0 AND toilet_use <= 10),
        transfers INTEGER CHECK (transfers >= 0 AND transfers <= 15),
        mobility INTEGER CHECK (mobility >= 0 AND mobility <= 15),
        stairs INTEGER CHECK (stairs >= 0 AND stairs <= 10),
        total_score INTEGER GENERATED ALWAYS AS (
          COALESCE(feeding, 0) + COALESCE(bathing, 0) + COALESCE(grooming, 0) + 
          COALESCE(dressing, 0) + COALESCE(bowels, 0) + COALESCE(bladder, 0) + 
          COALESCE(toilet_use, 0) + COALESCE(transfers, 0) + COALESCE(mobility, 0) + 
          COALESCE(stairs, 0)
        ) STORED,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- MRC Scales table
      CREATE TABLE IF NOT EXISTS mrc_scales (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        hospital_id TEXT REFERENCES hospitals(id),
        service_id TEXT REFERENCES services(id),
        user_id TEXT REFERENCES users(id),
        patient_id TEXT REFERENCES patients(id),
        evaluation_date TIMESTAMP NOT NULL,
        muscle_groups JSONB NOT NULL,
        total_score DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_hospitals_client_id ON hospitals(client_id);
      CREATE INDEX IF NOT EXISTS idx_services_hospital_id ON services(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_users_service_id ON users(service_id);
      CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_patients_service_id ON patients(service_id);
      CREATE INDEX IF NOT EXISTS idx_indicators_date ON indicators(date);
      CREATE INDEX IF NOT EXISTS idx_barthel_scales_evaluation_date ON barthel_scales(evaluation_date);
      CREATE INDEX IF NOT EXISTS idx_mrc_scales_evaluation_date ON mrc_scales(evaluation_date);
    `;
    
    // Executar as migrações
    await this.$executeRawUnsafe(tenantTables);
    
    console.log(`✅ Migrações executadas para schema: ${schema}`);
  }
  
  /**
   * Remove um schema de tenant (cuidado!)
   */
  async dropTenantSchema(schema: string): Promise<void> {
    try {
      await this.$executeRaw`DROP SCHEMA IF EXISTS ${schema} CASCADE`;
      console.log(`🗑️ Schema ${schema} removido`);
    } catch (error) {
      console.error(`Erro ao remover schema ${schema}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const tenantPrisma = new TenantPrismaClient();

/**
 * Helper para obter uma instância Prisma configurada para um tenant
 */
export const getTenantPrisma = async (tenantSchema: string): Promise<TenantPrismaClient> => {
  await tenantPrisma.setSchema(tenantSchema);
  return tenantPrisma;
};

/**
 * Helper para executar uma operação com isolamento de tenant
 */
export const withTenantIsolation = async <T>(
  req: TenantRequest,
  operation: (prisma: TenantPrismaClient) => Promise<T>
): Promise<T> => {
  if (!req.tenant) {
    throw createError('Contexto de tenant necessário', 400);
  }
  
  return await tenantPrisma.withTenant(req.tenant.schema, operation);
};