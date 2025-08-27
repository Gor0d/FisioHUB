# FisioHUB - Sistema de Indicadores Clínicos

## 📋 STATUS ATUAL DO SISTEMA (27/08/2025)

### ✅ FUNCIONALIDADES IMPLEMENTADAS

#### 1. **Sistema de Indicadores Básico**
- **Dashboard completo** com 8 tipos de indicadores
- **Formulário de registro** funcional
- **API endpoints** para GET/POST indicators
- **Processamento de dados** com métricas e tendências
- **Interface responsiva** com cards e estatísticas

#### 2. **Tipos de Indicadores Configurados**
```javascript
indicatorTypes = {
  early_mobilization: { name: 'Mobilização Precoce', unit: '%', target: 80, category: 'mobility' },
  mechanical_ventilation: { name: 'Tempo Ventilação Mecânica', unit: 'dias', target: 5, category: 'respiratory' },
  functional_independence: { name: 'Independência Funcional', unit: 'pontos', target: 85, category: 'functional' },
  muscle_strength: { name: 'Força Muscular', unit: 'pontos', target: 48, category: 'strength' },
  hospital_stay: { name: 'Tempo de Internação', unit: 'dias', target: 12, category: 'efficiency' },
  readmission_30d: { name: 'Readmissão 30 dias', unit: '%', target: 8, category: 'quality' },
  patient_satisfaction: { name: 'Satisfação do Paciente', unit: 'pontos', target: 9, category: 'satisfaction' },
  discharge_destination: { name: 'Alta para Casa', unit: '%', target: 75, category: 'outcomes' }
}
```

#### 3. **Endpoints Funcionais**
- `GET /api/indicators/types` - Configurações dos tipos ✅
- `POST /api/indicators` - Registrar novo indicador ✅
- `GET /api/indicators` - Listar indicadores ✅
- `GET /api/dashboard/:tenantId` - Dashboard com analytics ✅

#### 4. **Frontend Completo**
- Página: `/t/[slug]/indicators` ✅
- Formulário modal de registro ✅
- Dashboard com cards de métricas ✅
- Filtros por período (7d, 30d, 90d, 1y) ✅

---

## 🎯 PRÓXIMAS TAREFAS - ROADMAP INDICADORES

### **FASE 1: AUTOMATIZAÇÃO DE INDICADORES QUANTITATIVOS**

#### 1.1 **Tempo de Internação** (AUTOMÁTICO)
**Fonte**: Tabela `patients` - `admissionDate` vs `dischargeDate`
```sql
-- Cálculo automático
SELECT AVG(EXTRACT(DAY FROM (dischargeDate - admissionDate))) as avg_hospital_stay
FROM patients 
WHERE dischargeDate IS NOT NULL AND admissionDate IS NOT NULL
```
**Implementação**: Endpoint que calcula automaticamente baseado nos pacientes

#### 1.2 **Taxa de Ocupação por Leito** (AUTOMÁTICO)
**Fonte**: Tabela `bed_transfers` + `patients`
```sql
-- Leitos ocupados vs total de leitos
SELECT 
  COUNT(DISTINCT bedNumber) as occupied_beds,
  -- Total beds seria configurável por tenant
FROM patients WHERE isActive = true
```

#### 1.3 **Transferências por Dia** (AUTOMÁTICO)
**Fonte**: Tabela `bed_transfers`
```sql
SELECT COUNT(*) as daily_transfers
FROM bed_transfers 
WHERE DATE(transferDate) = CURRENT_DATE
```

#### 1.4 **Altas por Período** (AUTOMÁTICO)
**Fonte**: Tabela `patients`
```sql
SELECT COUNT(*) as discharges_count
FROM patients 
WHERE dischargeDate BETWEEN ? AND ?
```

### **FASE 2: INDICADORES SEMI-AUTOMÁTICOS**

#### 2.1 **Mobilização Precoce**
- **Manual**: Registro pelo fisioterapeuta
- **Semi-automático**: Sugerir baseado em tempo de internação < 24h
- **Meta**: 80% dos pacientes mobilizados nas primeiras 24h

#### 2.2 **Independência Funcional (Barthel)**
- **Manual**: Avaliações registradas
- **Automático**: Calcular média dos scores Barthel por período
- **Integração**: Com sistema de assessments existente

#### 2.3 **Força Muscular (MRC)**
- **Manual**: Avaliações registradas  
- **Automático**: Calcular média dos scores MRC por período
- **Integração**: Com sistema de assessments existente

### **FASE 3: INDICADORES MANUAIS**

#### 3.1 **Satisfação do Paciente**
- Formulário específico de satisfação
- Integração com WhatsApp/SMS para feedback
- Dashboard de NPS hospitalar

#### 3.2 **Readmissão 30 dias**
- Sistema de follow-up pós-alta
- Integração com sistema externo ou manual

---

## 🛠️ TAREFAS TÉCNICAS NECESSÁRIAS

### **Backend - Automação**
```javascript
// Novos endpoints a criar:
GET /api/indicators/automatic/:tenantId
POST /api/indicators/calculate/:type
GET /api/analytics/hospital-stay/:tenantId
GET /api/analytics/bed-occupation/:tenantId
GET /api/analytics/transfers-daily/:tenantId
```

### **Frontend - Dashboard Avançado**
- Gráficos de linha para tendências temporais
- Gráficos de pizza para distribuição
- Cards de métricas em tempo real
- Alertas quando metas não são atingidas
- Exportação de relatórios em PDF/Excel

### **Database - Novas Tabelas**
```sql
-- Configurações de metas por tenant
CREATE TABLE tenant_targets (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  indicatorType TEXT NOT NULL,
  targetValue FLOAT NOT NULL,
  -- ...
);

-- Histórico de cálculos automáticos
CREATE TABLE indicator_calculations (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  calculationType TEXT NOT NULL,
  calculatedAt TIMESTAMP DEFAULT NOW(),
  result JSON NOT NULL,
  -- ...
);
```

---

## 📊 INDICADORES POR CATEGORIA

### **🏃 MOBILIDADE**
- ✅ Mobilização Precoce (manual/semi-automático)
- 🔄 **Próximo**: Tempo médio para primeira mobilização

### **🫁 RESPIRATÓRIO** 
- ✅ Tempo Ventilação Mecânica (manual)
- 🔄 **Próximo**: Taxa de desmame ventilatório

### **💪 FUNCIONAL**
- ✅ Independência Funcional - Barthel (integrar com assessments)
- ✅ Força Muscular - MRC (integrar com assessments)

### **⏱️ EFICIÊNCIA**
- ✅ Tempo de Internação (**AUTOMATIZAR**)
- 🔄 **Próximo**: Taxa de ocupação por leito (**AUTOMATIZAR**)
- 🔄 **Próximo**: Rotatividade de leitos

### **🎯 QUALIDADE**
- ✅ Readmissão 30 dias (manual/integração)
- 🔄 **Próximo**: Taxa de infecção hospitalar
- 🔄 **Próximo**: Eventos adversos

### **😊 SATISFAÇÃO**
- ✅ Satisfação do Paciente (formulário)
- 🔄 **Próximo**: NPS Fisioterapia
- 🔄 **Próximo**: Feedback familiar

### **📈 DESFECHOS**
- ✅ Alta para Casa (automático baseado em `dischargeReason`)
- 🔄 **Próximo**: Melhora funcional (Barthel entrada vs saída)

---

## 🎯 METAS DE AUTOMAÇÃO

### **Nível 1 - Dados Existentes (RÁPIDO)**
- [x] Tempo de internação médio
- [ ] Número de altas por dia
- [ ] Número de transferências por dia  
- [ ] Taxa de ocupação de leitos
- [ ] Distribuição por motivo de alta

### **Nível 2 - Integração Assessments (MÉDIO)**
- [ ] Média de scores Barthel por período
- [ ] Média de scores MRC por período
- [ ] Evolução funcional (entrada vs saída)
- [ ] Tempo médio para avaliação inicial

### **Nível 3 - Novos Dados (LONGO PRAZO)**
- [ ] Mobilização nas primeiras 24h
- [ ] Satisfação do paciente automatizada
- [ ] Follow-up pós-alta
- [ ] Integração com sistemas externos

---

## 🚀 PRÓXIMA SESSÃO - CHECKLIST

### **1. Definir Indicadores Prioritários**
- [ ] Revisar lista com foco clínico
- [ ] Priorizar indicadores quantitativos/automáticos
- [ ] Definir metas por indicador

### **2. Implementar Automação Básica** 
- [ ] Endpoint para tempo de internação automático
- [ ] Endpoint para contagem de altas/transferências
- [ ] Dashboard com dados reais automáticos

### **3. Integrar com Assessments Existentes**
- [ ] Conectar Barthel/MRC com indicadores
- [ ] Calcular médias automáticas
- [ ] Trends de evolução funcional

### **4. Melhorar UX do Dashboard**
- [ ] Gráficos visuais (Chart.js ou similar)
- [ ] Alertas para metas não atingidas  
- [ ] Export de relatórios

### **5. Configurações por Tenant**
- [ ] Metas customizáveis por hospital
- [ ] Tipos de indicadores habilitados/desabilitados
- [ ] Períodos de cálculo configuráveis

---

## 📁 ARQUIVOS RELEVANTES

### **Backend**
- `backend/index.js` - Endpoints principais ✅
- `backend/prisma/schema.prisma` - Database schema ✅

### **Frontend**  
- `frontend/src/app/t/[slug]/indicators/page.tsx` - Dashboard ✅
- `frontend/src/components/indicators/indicator-form.tsx` - Formulário ✅

### **Próximos Arquivos**
- `backend/src/services/indicatorCalculator.js` - Cálculos automáticos
- `backend/src/controllers/analyticsController.js` - Analytics
- `frontend/src/components/charts/IndicatorChart.tsx` - Gráficos

---

**Última atualização**: 27/08/2025
**Status**: Sistema básico funcionando, pronto para automação
**Próximo milestone**: Indicadores automáticos baseados em dados existentes