# FisioHUB - Indicadores Quantitativos da Fisioterapia

## 📊 LISTA ORGANIZADA DE INDICADORES QUANTITATIVOS

### **👥 INDICADORES DE VOLUME/CAPTAÇÃO**

#### 1. **Pacientes Internados** 
- **Definição**: Total de pacientes internados no período
- **Fonte**: `patients` WHERE `isActive = true`
- **Automação**: ✅ Automático - Contagem direta do banco

#### 2. **Pacientes Prescritos para Fisioterapia**
- **Definição**: Taxa de pacientes captados pela Fisioterapia nas unidades
- **Fonte**: `patients` com flag de fisioterapia ou tabela de prescrições
- **Automação**: 🔄 Precisa campo `physiotherapyPrescribed` na tabela patients

#### 3. **Pacientes Atendidos pela Fisioterapia**
- **Definição**: Número de pacientes que receberam atendimento
- **Fonte**: Tabela `appointments` ou `evolutions` relacionada à fisioterapia
- **Automação**: ✅ Baseado em appointments/evolutions existentes

---

### **📈 INDICADORES DE DESFECHO**

#### 4. **Altas**
- **Definição**: Total de altas no período
- **Fonte**: `patients` WHERE `dischargeDate IS NOT NULL`
- **Automação**: ✅ Automático - Contagem por período

#### 5. **Óbitos**
- **Definição**: Total de óbitos no período  
- **Fonte**: `patients` WHERE `dischargeReason = 'óbito'`
- **Automação**: ✅ Automático - Baseado em motivo da alta

#### 6. **Intubações**
- **Definição**: Número de intubações no período
- **Fonte**: Campo específico ou evolução clínica
- **Automação**: 🔄 Precisa campo `intubations` ou marcação nas evoluções

#### 7. **PCR (Parada Cardiorrespiratória)**
- **Definição**: Número de PCRs no período
- **Fonte**: Campo específico ou evolução clínica
- **Automação**: 🔄 Precisa campo `pcr_events` ou marcação nas evoluções

---

### **🫁 INDICADORES RESPIRATÓRIOS**

#### 8. **Pacientes com Via Aérea Artificial**
- **Definição**: Número de pacientes-dia com via aérea artificial
- **Fonte**: Campo `airway_type` na tabela patients ou evoluções
- **Automação**: 🔄 Precisa campo específico

#### 9. **Taxa de Fisioterapia Respiratória**
- **Definição**: % de Fisioterapia Respiratória realizada durante o atendimento
- **Fonte**: Marcação no atendimento/evolução
- **Automação**: 🔄 Precisa checkbox nas evoluções

#### 10. **Taxa de Aspiração**
- **Definição**: % de pacientes com via aérea artificial que precisaram ser aspirados
- **Fonte**: Procedimentos realizados durante atendimento
- **Automação**: 🔄 Precisa registro de procedimentos

#### 11. **Oxigenoterapia**
- **Definição**: Número de pacientes que usam oxigenoterapia
- **Fonte**: Campo `oxygen_therapy` 
- **Automação**: 🔄 Precisa campo específico

#### 12. **Ventilação Não Invasiva**
- **Definição**: Taxa de VNI realizada pelos serviços de Fisioterapia
- **Fonte**: Procedimentos de fisioterapia
- **Automação**: 🔄 Precisa registro de procedimentos

#### 13. **Ventilação Mecânica Invasiva**
- **Definição**: Taxa de VMI realizada pelos serviços de Fisioterapia
- **Fonte**: Procedimentos de fisioterapia
- **Automação**: 🔄 Precisa registro de procedimentos

#### 14. **Traqueostomia**
- **Definição**: Número de pacientes com traqueostomia
- **Fonte**: Campo específico
- **Automação**: 🔄 Precisa campo `tracheostomy`

#### 15. **Pronação**
- **Definição**: Número/taxa de pronações realizadas
- **Fonte**: Procedimentos durante atendimento
- **Automação**: 🔄 Precisa registro de procedimentos

---

### **🏃 INDICADORES DE MOBILIDADE**

#### 16. **Taxa de Fisioterapia Motora**
- **Definição**: % de Fisioterapia Motora realizada durante atendimento
- **Fonte**: Marcação no atendimento/evolução
- **Automação**: 🔄 Precisa checkbox nas evoluções

#### 17. **Taxa de Sedestação**
- **Definição**: % de pacientes que conseguiram sedestação após atendimento
- **Fonte**: Evolução funcional/mobilidade
- **Automação**: 🔄 Precisa campo de mobilidade

#### 18. **Taxa de Ortostatismo**
- **Definição**: % de pacientes que conseguiram ortostatismo após atendimento
- **Fonte**: Evolução funcional/mobilidade
- **Automação**: 🔄 Precisa campo de mobilidade

#### 19. **Taxa de Deambulação**
- **Definição**: % de Deambulação realizada durante Fisioterapia
- **Fonte**: Evolução funcional/mobilidade
- **Automação**: 🔄 Precisa campo de mobilidade

#### 20. **Pacientes que Não Deambulavam**
- **Definição**: Número de pacientes atendidos que não deambulavam inicialmente
- **Fonte**: Avaliação inicial vs atual
- **Automação**: 🔄 Precisa campo de mobilidade inicial/atual

---

### **📋 INDICADORES DE PROCESSO**

#### 21. **Extubações Programadas**
- **Definição**: Taxa de efetividade nas Extubações Programadas
- **Fonte**: Registro de procedimentos e resultado
- **Automação**: 🔄 Precisa registro de extubações e sucesso

#### 22. **Visita Multidisciplinar**
- **Definição**: Taxa/número de visitas multidisciplinares
- **Fonte**: Registro de rounds/visitas
- **Automação**: 🔄 Precisa sistema de rounds

---

## 🛠️ PLANO DE IMPLEMENTAÇÃO

### **FASE 1: INDICADORES AUTOMÁTICOS (JÁ TEMOS OS DADOS)**

```sql
-- 1. Pacientes Internados
SELECT COUNT(*) FROM patients WHERE isActive = true;

-- 2. Altas no período
SELECT COUNT(*) FROM patients WHERE dischargeDate BETWEEN ? AND ?;

-- 3. Óbitos no período  
SELECT COUNT(*) FROM patients WHERE dischargeReason = 'óbito' AND dischargeDate BETWEEN ? AND ?;

-- 4. Pacientes Atendidos pela Fisioterapia
SELECT COUNT(DISTINCT patientId) FROM appointments WHERE DATE(date) BETWEEN ? AND ?;
```

### **FASE 2: EXPANDIR SCHEMA PARA CAPTURAR NOVOS DADOS**

#### Adicionar à tabela `patients`:
```sql
ALTER TABLE patients ADD COLUMN physiotherapyPrescribed BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN airwayType VARCHAR(50); -- 'natural', 'intubated', 'tracheostomy'
ALTER TABLE patients ADD COLUMN oxygenTherapy BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN initialMobility VARCHAR(50); -- 'bed', 'sitting', 'standing', 'walking'
ALTER TABLE patients ADD COLUMN currentMobility VARCHAR(50);
```

#### Nova tabela `physiotherapy_procedures`:
```sql
CREATE TABLE physiotherapy_procedures (
  id TEXT PRIMARY KEY,
  appointmentId TEXT NOT NULL,
  patientId TEXT NOT NULL,
  -- Procedimentos Respiratórios
  respiratoryPhysiotherapy BOOLEAN DEFAULT false,
  aspiration BOOLEAN DEFAULT false,
  noninvasiveVentilation BOOLEAN DEFAULT false,
  invasiveVentilation BOOLEAN DEFAULT false,
  pronation BOOLEAN DEFAULT false,
  -- Procedimentos Motores  
  motorPhysiotherapy BOOLEAN DEFAULT false,
  sedestation BOOLEAN DEFAULT false,
  orthostatism BOOLEAN DEFAULT false,
  ambulation BOOLEAN DEFAULT false,
  -- Outros
  extubation BOOLEAN DEFAULT false,
  extubationSuccess BOOLEAN DEFAULT false,
  date TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### Nova tabela `clinical_events`:
```sql
CREATE TABLE clinical_events (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  eventType VARCHAR(50) NOT NULL, -- 'intubation', 'pcr', 'extubation', 'tracheostomy'
  eventDate TIMESTAMP NOT NULL,
  success BOOLEAN, -- Para extubações programadas
  notes TEXT,
  createdBy TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### **FASE 3: ENDPOINTS DE AUTOMAÇÃO**

```javascript
// Novos endpoints necessários:
GET /api/indicators/volume/:tenantId        // Pacientes internados, prescritos, atendidos
GET /api/indicators/outcomes/:tenantId      // Altas, óbitos, intubações, PCR
GET /api/indicators/respiratory/:tenantId   // Todos os indicadores respiratórios
GET /api/indicators/mobility/:tenantId      // Todos os indicadores de mobilidade
GET /api/indicators/procedures/:tenantId    // Procedimentos e efetividade

// Dashboard consolidado
GET /api/indicators/dashboard-quantitative/:tenantId
```

### **FASE 4: INTERFACE DE REGISTRO RÁPIDO**

#### Componente `QuickProcedureForm.tsx`:
- Checkboxes rápidos durante o atendimento
- Registro de procedimentos respiratórios
- Registro de procedimentos motores  
- Eventos clínicos (intubação, PCR, etc.)

#### Dashboard Quantitativo:
- Cards com números grandes
- Comparação com período anterior
- Alertas para indicadores críticos
- Export para relatórios gerenciais

---

## 📊 DASHBOARD QUANTITATIVO - WIREFRAME

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 INDICADORES QUANTITATIVOS - FISIOTERAPIA                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Pacientes Internados: 45] [Prescritos Fisio: 38] [Atendidos: 35] │
│  [Altas: 12] [Óbitos: 2] [Intubações: 5] [PCR: 1]              │
│                                                                 │
│  🫁 RESPIRATÓRIO                                                │
│  [Via Aérea Artificial: 15] [Aspirações: 23] [VNI: 8] [VMI: 7] │
│  [Pronações: 3] [Oxigenoterapia: 28] [Traqueostomias: 4]       │
│                                                                 │
│  🏃 MOBILIDADE                                                  │  
│  [Fisio Motora: 89%] [Sedestação: 67%] [Ortostatismo: 45%]     │
│  [Deambulação: 23%] [Não Deambulavam: 31]                      │
│                                                                 │
│  📋 PROCEDIMENTOS                                               │
│  [Extubações: 3] [Sucesso: 100%] [Rounds Multi: 15]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASSOS

### **Esta Sessão:**
1. [ ] Implementar indicadores automáticos (Fase 1)
2. [ ] Criar endpoints básicos de volume/desfechos
3. [ ] Dashboard quantitativo simples

### **Próximas Sessões:**
1. [ ] Expandir schema do banco (Fase 2)
2. [ ] Formulário de registro rápido
3. [ ] Todos os 22 indicadores funcionando
4. [ ] Dashboard completo com comparações
5. [ ] Relatórios automáticos para gestão

---

**Foco**: Números claros, automação máxima, registro mínimo de overhead
**Meta**: Dashboard executivo com todos os KPIs da fisioterapia hospitalar