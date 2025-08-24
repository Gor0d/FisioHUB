# FisioHUB - Arquitetura Multitenancy

## 🏗️ **Visão Geral da Arquitetura**

### **Modelo Escolhido: Schema-per-Tenant**
- **Isolamento**: Schema separado por cliente no mesmo database
- **Segurança**: Isolamento completo de dados
- **Performance**: Sem overhead de filtros por tenant
- **Manutenção**: Schema shared para management

---

## 📊 **Estrutura do Banco de Dados**

### **Schema Público (shared)**
```sql
-- Tabela de tenants (clientes)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(50) UNIQUE,
    custom_domain VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#10B981',
    secondary_color VARCHAR(7) DEFAULT '#3B82F6',
    plan VARCHAR(50) DEFAULT 'basic',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    trial_ends_at TIMESTAMP,
    last_activity_at TIMESTAMP
);

-- Configurações do tenant
CREATE TABLE public.tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, key)
);

-- Planos de assinatura
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB,
    limits JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas dos tenants
CREATE TABLE public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuários globais (para acesso multi-tenant)
CREATE TABLE public.global_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_super_admin BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Acesso de usuários aos tenants
CREATE TABLE public.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    global_user_id UUID REFERENCES global_users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    invited_at TIMESTAMP,
    joined_at TIMESTAMP,
    last_access_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, global_user_id)
);
```

### **Schema por Tenant**
```sql
-- Para cada tenant: CREATE SCHEMA tenant_{tenant_id};

-- Migração automática para cada schema de tenant
-- Todas as tabelas existentes são replicadas:

CREATE TABLE tenant_{id}.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tenant_{id}.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    address JSONB,
    contact_info JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, client_id)
);

CREATE TABLE tenant_{id}.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    icon VARCHAR(50) DEFAULT 'stethoscope',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, hospital_id)
);

CREATE TABLE tenant_{id}.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_user_id UUID, -- Reference to public.global_users
    hospital_id UUID REFERENCES hospitals(id),
    service_id UUID REFERENCES services(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    specialty VARCHAR(255),
    role VARCHAR(50) DEFAULT 'collaborator',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Todas as outras tabelas (patients, indicators, scales, etc.)
-- seguem o mesmo padrão no schema do tenant
```

---

## 🔧 **Middleware de Tenant Resolution**

### **1. Resolução de Tenant**
```typescript
// middleware/tenantResolver.ts
export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    schema: string;
  };
}

export const tenantResolver = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantSlug: string | null = null;
    
    // 1. Via subdomain (api.cliente.fisiohub.com)
    const host = req.headers.host;
    if (host) {
      const parts = host.split('.');
      if (parts.length >= 3) {
        tenantSlug = parts[0];
      }
    }
    
    // 2. Via header customizado
    if (!tenantSlug) {
      tenantSlug = req.headers['x-tenant-slug'] as string;
    }
    
    // 3. Via query parameter (para desenvolvimento)
    if (!tenantSlug) {
      tenantSlug = req.query.tenant as string;
    }
    
    if (!tenantSlug) {
      return res.status(400).json({
        error: 'Tenant não identificado'
      });
    }
    
    // Buscar tenant no banco
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      }
    });
    
    if (!tenant || tenant.status !== 'active') {
      return res.status(404).json({
        error: 'Tenant não encontrado ou inativo'
      });
    }
    
    // Adicionar informações do tenant na request
    req.tenant = {
      ...tenant,
      schema: `tenant_${tenant.id.replace('-', '_')}`
    };
    
    next();
  } catch (error) {
    console.error('Erro no tenant resolver:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
```

### **2. Database Context Switching**
```typescript
// lib/tenantPrisma.ts
import { PrismaClient } from '@prisma/client';

class TenantPrismaClient extends PrismaClient {
  private currentSchema?: string;
  
  async setSchema(schema: string) {
    this.currentSchema = schema;
    await this.$executeRaw`SET search_path TO ${schema}, public`;
  }
  
  async withTenant<T>(schema: string, operation: () => Promise<T>): Promise<T> {
    await this.setSchema(schema);
    try {
      return await operation();
    } finally {
      // Reset to default schema
      await this.$executeRaw`SET search_path TO public`;
    }
  }
}

// Singleton instance
export const tenantPrisma = new TenantPrismaClient();
```

### **3. Middleware de Isolamento**
```typescript
// middleware/tenantIsolation.ts
export const tenantIsolation = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant context required'
    });
  }
  
  // Switch database context
  await tenantPrisma.setSchema(req.tenant.schema);
  
  // Add tenant-aware Prisma instance to request
  req.tenantDb = tenantPrisma;
  
  next();
};
```

---

## 🚀 **Sistema de Migração Automática**

### **1. Criação de Tenant**
```typescript
// services/tenantService.ts
export class TenantService {
  async createTenant(data: {
    name: string;
    slug: string;
    email: string;
    plan?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Criar tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          plan: data.plan || 'basic'
        }
      });
      
      // 2. Criar schema
      const schemaName = `tenant_${tenant.id.replace('-', '_')}`;
      await tx.$executeRaw`CREATE SCHEMA ${schemaName}`;
      
      // 3. Executar migrações
      await this.runTenantMigrations(schemaName);
      
      // 4. Criar dados iniciais
      await this.seedTenantData(tenant.id, schemaName, data);
      
      return tenant;
    });
  }
  
  private async runTenantMigrations(schema: string) {
    // Executar todas as migrações para o schema do tenant
    const migrations = await this.getTenantMigrations();
    
    for (const migration of migrations) {
      await prisma.$executeRaw(
        `SET search_path TO ${schema}, public; ${migration.sql}`
      );
    }
  }
  
  private async seedTenantData(
    tenantId: string,
    schema: string,
    data: any
  ) {
    await prisma.$executeRaw`SET search_path TO ${schema}, public`;
    
    // Criar cliente padrão
    const client = await prisma.client.create({
      data: { name: data.name }
    });
    
    // Criar hospital padrão
    await prisma.hospital.create({
      data: {
        client_id: client.id,
        name: `${data.name} - Unidade Principal`,
        code: 'principal'
      }
    });
  }
}
```

---

## 🔐 **Sistema de Autenticação Multi-Tenant**

### **1. JWT com Context**
```typescript
// utils/tenantAuth.ts
interface TenantJWTPayload {
  userId: string;
  globalUserId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export const generateTenantToken = (payload: TenantJWTPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h',
    issuer: 'fisiohub-saas'
  });
};

export const verifyTenantToken = (token: string): TenantJWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TenantJWTPayload;
};
```

### **2. Middleware de Autenticação**
```typescript
// middleware/tenantAuth.ts
export const tenantAuth = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token necessário' });
    }
    
    const payload = verifyTenantToken(token);
    
    // Verificar se o token é válido para este tenant
    if (payload.tenantId !== req.tenant?.id) {
      return res.status(403).json({ error: 'Token inválido para este tenant' });
    }
    
    // Buscar usuário no contexto do tenant
    await tenantPrisma.setSchema(req.tenant.schema);
    const user = await tenantPrisma.user.findUnique({
      where: { id: payload.userId },
      include: { 
        hospital: true,
        service: true 
      }
    });
    
    if (!user || !user.active) {
      return res.status(403).json({ error: 'Usuário inativo' });
    }
    
    req.user = {
      ...user,
      globalUserId: payload.globalUserId,
      role: payload.role,
      permissions: payload.permissions
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

---

## 📈 **Sistema de Billing e Limites**

### **1. Verificação de Limites**
```typescript
// middleware/planLimits.ts
export const checkPlanLimits = (resource: string, action: string) => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant required' });
    }
    
    // Buscar plano do tenant
    const subscription = await prisma.tenantSubscription.findFirst({
      where: { 
        tenant_id: req.tenant.id,
        status: 'active'
      },
      include: { plan: true }
    });
    
    if (!subscription) {
      return res.status(402).json({ error: 'Assinatura necessária' });
    }
    
    const limits = subscription.plan.limits as any;
    
    // Verificar limite específico
    if (action === 'CREATE') {
      const currentCount = await getCurrentResourceCount(
        req.tenant.schema,
        resource
      );
      
      if (currentCount >= limits[resource]) {
        return res.status(402).json({
          error: `Limite de ${resource} atingido`,
          limit: limits[resource],
          current: currentCount
        });
      }
    }
    
    next();
  };
};
```

---

## 🔄 **APIs Multi-Tenant**

### **1. Estrutura de Rotas**
```typescript
// routes/tenantRoutes.ts
const router = Router();

// Aplicar middlewares na ordem correta
router.use(tenantResolver);
router.use(tenantIsolation);
router.use(tenantAuth);

// Rotas específicas do tenant
router.get('/hospitals', checkPlanLimits('hospitals', 'READ'), getHospitals);
router.post('/hospitals', checkPlanLimits('hospitals', 'CREATE'), createHospital);

// Rotas com escopo
router.get('/hospitals/:hospitalId/services', getHospitalServices);
router.post('/services', checkPermission('services:create'), createService);

export { router as tenantRoutes };
```

### **2. Controllers Adaptados**
```typescript
// controllers/tenantHospitals.ts
export const getHospitals = async (req: TenantRequest, res: Response) => {
  try {
    const hospitals = await req.tenantDb.hospital.findMany({
      include: {
        _count: {
          select: {
            services: true,
            users: true,
            patients: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    console.error('Erro ao buscar hospitais:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
```

---

## 📱 **Frontend Multi-Tenant**

### **1. Context de Tenant**
```typescript
// contexts/tenantContext.tsx
interface TenantContextType {
  tenant: Tenant | null;
  user: TenantUser | null;
  loading: boolean;
  switchTenant: (tenantSlug: string) => Promise<void>;
}

export const TenantProvider: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<TenantUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auto-detect tenant from URL
  useEffect(() => {
    const detectTenant = async () => {
      const subdomain = window.location.hostname.split('.')[0];
      
      if (subdomain && subdomain !== 'www') {
        await loadTenant(subdomain);
      }
    };
    
    detectTenant();
  }, []);
  
  const loadTenant = async (slug: string) => {
    try {
      const response = await api.get(`/api/tenant/info`, {
        headers: { 'X-Tenant-Slug': slug }
      });
      
      setTenant(response.data);
    } catch (error) {
      console.error('Erro ao carregar tenant:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TenantContext.Provider value={{
      tenant,
      user,
      loading,
      switchTenant: loadTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};
```

### **2. API Client com Tenant**
```typescript
// lib/tenantApi.ts
class TenantApiClient {
  private baseURL: string;
  private tenantSlug?: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.tenantSlug = this.detectTenantFromURL();
  }
  
  private detectTenantFromURL(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    const subdomain = window.location.hostname.split('.')[0];
    return subdomain !== 'www' ? subdomain : undefined;
  }
  
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('tenant-token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(this.tenantSlug && { 'X-Tenant-Slug': this.tenantSlug }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }
}

export const tenantApi = new TenantApiClient();
```

---

## 🚀 **Próximos Passos**

1. ✅ **Análise completa de requisitos**
2. 🔄 **Implementar estrutura de tenants**
3. 📊 **Criar sistema de migração automática**
4. 🔐 **Implementar autenticação multi-tenant**
5. 🏥 **Portal de cadastro de clientes**
6. 👥 **Sistema de gestão de colaboradores**
7. 💰 **Integração com sistema de billing**

---

*Arquitetura projetada para suportar milhares de tenants com isolamento completo e performance otimizada.*