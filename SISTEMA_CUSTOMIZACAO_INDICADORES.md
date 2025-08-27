# FisioHUB - Sistema de Customização de Indicadores por Cliente

## 🏥 SISTEMA MULTI-TENANT CUSTOMIZÁVEL

### **PROBLEMA IDENTIFICADO**
- Cada cliente (Hospital Galileu, etc.) tem indicadores específicos
- Necessidade de personalização por instituição
- Logo e branding específico por cliente
- Configurações flexíveis por tenant

---

## 🛠️ ARQUITETURA DE CUSTOMIZAÇÃO

### **1. TABELA DE CONFIGURAÇÃO POR TENANT**

```sql
-- Nova tabela: tenant_indicator_configs
CREATE TABLE tenant_indicator_configs (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  indicatorKey VARCHAR(100) NOT NULL, -- 'pacientes_internados', 'altas', etc.
  indicatorName VARCHAR(255) NOT NULL, -- 'Pacientes Internados'
  indicatorDescription TEXT,
  unit VARCHAR(50), -- 'pacientes', '%', 'dias', 'números'
  category VARCHAR(100), -- 'volume', 'desfecho', 'respiratorio', 'mobilidade'
  isActive BOOLEAN DEFAULT true,
  displayOrder INTEGER DEFAULT 0,
  target FLOAT, -- Meta específica do cliente
  alertThreshold FLOAT, -- Quando alertar
  calculationType VARCHAR(50), -- 'automatic', 'manual', 'semi-automatic'
  sqlQuery TEXT, -- Query SQL para indicadores automáticos
  isRequired BOOLEAN DEFAULT false, -- Obrigatório para o tenant
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenantId, indicatorKey)
);
```

### **2. PERSONALIZAÇÃO VISUAL POR TENANT**

```sql
-- Expandir tabela tenants existente
ALTER TABLE tenants ADD COLUMN logoUrl TEXT;
ALTER TABLE tenants ADD COLUMN primaryColor VARCHAR(7) DEFAULT '#3B82F6'; -- Hex color
ALTER TABLE tenants ADD COLUMN secondaryColor VARCHAR(7) DEFAULT '#1E40AF';
ALTER TABLE tenants ADD COLUMN dashboardTitle VARCHAR(255) DEFAULT 'Indicadores Clínicos';
ALTER TABLE tenants ADD COLUMN dashboardSubtitle VARCHAR(255);
ALTER TABLE tenants ADD COLUMN reportHeader TEXT; -- HTML customizado para relatórios
```

### **3. DADOS ESPECÍFICOS POR CLIENTE**

#### **Hospital Galileu - Configuração**
```javascript
const hospitalGalileuIndicators = [
  {
    tenantId: '0li0k7HNQslV',
    indicatorKey: 'pacientes_internados',
    indicatorName: 'Pacientes Internados',
    category: 'volume',
    unit: 'pacientes',
    calculationType: 'automatic',
    sqlQuery: 'SELECT COUNT(*) FROM patients WHERE tenantId = ? AND isActive = true',
    displayOrder: 1,
    isActive: true
  },
  {
    tenantId: '0li0k7HNQslV',
    indicatorKey: 'pacientes_prescritos_fisio',
    indicatorName: 'Pacientes Prescritos para Fisioterapia',
    category: 'volume',
    unit: 'pacientes',
    calculationType: 'automatic',
    sqlQuery: 'SELECT COUNT(*) FROM patients WHERE tenantId = ? AND physiotherapyPrescribed = true',
    displayOrder: 2
  },
  {
    tenantId: '0li0k7HNQslV',
    indicatorKey: 'altas',
    indicatorName: 'Altas',
    category: 'desfecho',
    unit: 'pacientes',
    calculationType: 'automatic',
    sqlQuery: 'SELECT COUNT(*) FROM patients WHERE tenantId = ? AND dischargeDate BETWEEN ? AND ?',
    displayOrder: 3
  },
  {
    tenantId: '0li0k7HNQslV',
    indicatorKey: 'intubacoes',
    indicatorName: 'Intubações',
    category: 'respiratorio',
    unit: 'procedimentos',
    calculationType: 'automatic',
    sqlQuery: 'SELECT COUNT(*) FROM clinical_events WHERE tenantId = ? AND eventType = "intubation" AND eventDate BETWEEN ? AND ?',
    displayOrder: 4
  }
  // ... todos os 22 indicadores específicos do Hospital Galileu
];
```

---

## 📋 INTERFACE DE ADMINISTRAÇÃO

### **Página: Admin Dashboard de Configuração**
**URL**: `/admin/[tenantId]/indicators`

```typescript
// Componente: IndicatorConfigManager.tsx
interface IndicatorConfig {
  id: string;
  indicatorKey: string;
  indicatorName: string;
  description?: string;
  category: string;
  unit: string;
  calculationType: 'automatic' | 'manual' | 'semi-automatic';
  sqlQuery?: string;
  isActive: boolean;
  displayOrder: number;
  target?: number;
  alertThreshold?: number;
}
```

### **Funcionalidades da Interface:**

#### 1. **Configuração de Indicadores**
- ✅ Lista todos indicadores disponíveis
- ✅ Toggle ativo/inativo por indicador  
- ✅ Reordenação drag-and-drop
- ✅ Edição de nomes e descrições
- ✅ Configuração de metas e alertas

#### 2. **Personalização Visual**
- ✅ Upload de logo da instituição
- ✅ Seletor de cores primária/secundária
- ✅ Título e subtítulo do dashboard
- ✅ Preview em tempo real

#### 3. **Indicadores Customizados**
- ✅ Criar novos indicadores específicos
- ✅ SQL Query builder simples
- ✅ Teste de queries antes de salvar
- ✅ Categorização personalizada

---

## 🎨 PERSONALIZAÇÃO VISUAL

### **1. Logo e Branding**
```javascript
// Hook: useTenantBranding.ts
const useTenantBranding = () => {
  const { tenant } = useTenant();
  
  return {
    logo: tenant?.logoUrl || '/default-logo.png',
    primaryColor: tenant?.primaryColor || '#3B82F6',
    secondaryColor: tenant?.secondaryColor || '#1E40AF',
    dashboardTitle: tenant?.dashboardTitle || 'Indicadores Clínicos',
    dashboardSubtitle: tenant?.dashboardSubtitle || '',
    reportHeader: tenant?.reportHeader || ''
  };
};
```

### **2. CSS Customizado por Tenant**
```css
/* Gerado dinamicamente baseado nas cores do tenant */
.tenant-[tenantId] {
  --primary-color: #1E40AF; /* Hospital Galileu */
  --secondary-color: #3B82F6;
}

.tenant-another-client {
  --primary-color: #DC2626; /* Outro cliente */
  --secondary-color: #F87171;
}
```

### **3. Dashboard Personalizado**
```jsx
// Componente: CustomDashboard.tsx
const CustomDashboard = () => {
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const indicators = useTenantIndicators();

  return (
    <div className="dashboard" style={{ 
      '--primary': branding.primaryColor,
      '--secondary': branding.secondaryColor 
    }}>
      <header>
        <img src={branding.logo} alt={tenant.name} className="logo" />
        <h1>{branding.dashboardTitle}</h1>
        <p>{branding.dashboardSubtitle}</p>
      </header>
      
      <div className="indicators-grid">
        {indicators
          .filter(i => i.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(indicator => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))
        }
      </div>
    </div>
  );
};
```

---

## 📊 SISTEMA DE CÁLCULOS FLEXÍVEL

### **Engine de Cálculos Automáticos**
```javascript
// services/IndicatorCalculator.js
class IndicatorCalculator {
  async calculateIndicator(tenantId, indicatorConfig, dateRange) {
    switch (indicatorConfig.calculationType) {
      case 'automatic':
        return this.executeQuery(indicatorConfig.sqlQuery, [tenantId, ...dateRange]);
      
      case 'manual':
        return this.getManualValues(tenantId, indicatorConfig.indicatorKey, dateRange);
      
      case 'semi-automatic':
        return this.calculateSemiAutomatic(tenantId, indicatorConfig, dateRange);
      
      default:
        throw new Error(`Tipo de cálculo inválido: ${indicatorConfig.calculationType}`);
    }
  }

  async executeQuery(sqlQuery, params) {
    // Executa query SQL customizada de forma segura
    return await prisma.$queryRaw(sqlQuery, ...params);
  }

  async getManualValues(tenantId, indicatorKey, dateRange) {
    // Busca valores inseridos manualmente
    return await prisma.indicator.aggregate({
      where: { tenantId, type: indicatorKey, measurementDate: { gte: dateRange[0], lte: dateRange[1] } },
      _sum: { value: true }
    });
  }
}
```

---

## 🏗️ IMPLEMENTAÇÃO POR FASES

### **FASE 1: Base de Customização (Esta Sessão)**
- [ ] Criar tabela `tenant_indicator_configs`
- [ ] Endpoints básicos de configuração
- [ ] Interface simples de admin
- [ ] Sistema de logo upload

### **FASE 2: Hospital Galileu Setup**
- [ ] Migrar indicadores do Galileu para o novo sistema
- [ ] Configurar os 22 indicadores específicos
- [ ] Upload do logo Hospital Galileu
- [ ] Cores e branding personalizado

### **FASE 3: Dashboard Dinâmico**
- [ ] Dashboard que lê configurações do banco
- [ ] CSS dinâmico por tenant
- [ ] Cálculos automáticos funcionando
- [ ] Preview de indicadores customizados

### **FASE 4: Sistema Completo**
- [ ] Query builder visual
- [ ] Relatórios personalizados
- [ ] Export com branding
- [ ] Sistema para novos clientes

---

## 📋 ENDPOINTS NECESSÁRIOS

```javascript
// Configuração de Indicadores
GET    /api/admin/:tenantId/indicators/config        // Lista configurações
POST   /api/admin/:tenantId/indicators/config        // Cria nova configuração
PUT    /api/admin/:tenantId/indicators/config/:id    // Atualiza configuração
DELETE /api/admin/:tenantId/indicators/config/:id    // Remove configuração

// Branding e Personalização
GET    /api/admin/:tenantId/branding                 // Configurações visuais
PUT    /api/admin/:tenantId/branding                 // Atualiza branding
POST   /api/admin/:tenantId/logo                     // Upload logo

// Dashboard Customizado
GET    /api/indicators/custom-dashboard/:tenantId    // Dashboard baseado em config
POST   /api/indicators/calculate/:tenantId           // Força recálculo de indicadores

// Preset de Clientes
GET    /api/admin/indicator-presets                  // Templates pré-definidos
POST   /api/admin/:tenantId/apply-preset/:presetId   // Aplica template
```

---

## 🎯 RESULTADO FINAL

### **Para Hospital Galileu:**
```
┌────────────────────────────────────────────────────────┐
│  [LOGO GALILEU]     HOSPITAL GALILEU                   │
│                    Indicadores da Fisioterapia         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 VOLUME                                             │
│  [Pacientes Internados: 45] [Prescritos Fisio: 38]    │
│  [Taxa Captação: 84%] [Atendidos: 35]                 │
│                                                        │
│  📈 DESFECHOS                                          │
│  [Altas: 12] [Óbitos: 2] [Intubações: 5] [PCR: 1]    │
│                                                        │
│  🫁 RESPIRATÓRIO - Só os indicadores ativos do cliente│
│  [Via Aérea Artificial: 15] [Aspirações: 23]          │
│  [VNI: 8] [Pronações: 3]                              │
│                                                        │
│  🏃 MOBILIDADE - Configurado pelo cliente             │
│  [Fisio Motora: 89%] [Sedestação: 67%]               │
│  [Deambulação: 23%]                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### **Para Outro Cliente:**
```
┌────────────────────────────────────────────────────────┐
│  [LOGO CLIENTE]     HOSPITAL XYZ                       │
│                    Dashboard Personalizado             │
├────────────────────────────────────────────────────────┤
│  Indicadores completamente diferentes baseados nas     │
│  necessidades específicas deste cliente               │
└────────────────────────────────────────────────────────┘
```

---

## ✅ PRÓXIMOS PASSOS

1. **Implementar sistema base de customização**
2. **Configurar Hospital Galileu com seus 22 indicadores**
3. **Interface de admin para customização**
4. **Sistema pronto para novos clientes**

**Resultado**: Sistema 100% flexível onde cada cliente pode ter seus próprios indicadores, cores, logo e configurações! 🎉