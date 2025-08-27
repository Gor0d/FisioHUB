# 🏥 ROADMAP HOSPITAL GALILEU - Sistema Completo de Fisioterapia

## 🎯 **OBJETIVO FINAL**
Sistema completo de gestão hospitalar focado em **Indicadores Clínicos**, **Escalas de Avaliação** e **Evoluções de Fisioterapia** para o Hospital Galileu.

## 📋 **MÓDULOS PRIORITÁRIOS**

### 🔐 **1. AUTENTICAÇÃO POR EMAIL** - **PRIORIDADE MÁXIMA**
**Status**: ⏳ A implementar
**Descrição**: Sistema seguro de registro/login com confirmação por código via email

**Funcionalidades**:
- [x] Cadastro de tenant com email
- [ ] **Envio de código de verificação por email**
- [ ] **Confirmação de email com código de 6 dígitos**
- [ ] **Integração com provedor de email (SendGrid/Resend)**
- [ ] **Tentativas limitadas de verificação**
- [ ] **Expiração do código (10 minutos)**
- [ ] **Reenvio de código**

**Arquivos**:
- `backend/services/email-verification.js`
- `backend/middleware/email-auth.js`
- `frontend/components/email-verification.tsx`

---

### 📊 **2. INDICADORES CLÍNICOS** - **CORE DO SISTEMA**
**Status**: ⏳ A implementar
**Descrição**: Sistema principal de indicadores para fisioterapia hospitalar

**Indicadores Essenciais**:
- [ ] **Taxa de Mobilização Precoce**
- [ ] **Tempo de Ventilação Mecânica**
- [ ] **Independência Funcional (Barthel)**
- [ ] **Força Muscular (MRC)**
- [ ] **Tempo de Internação**
- [ ] **Readmissão em 30 dias**
- [ ] **Satisfação do Paciente**

**Funcionalidades**:
- [ ] **Dashboard de indicadores em tempo real**
- [ ] **Gráficos interativos (Chart.js)**
- [ ] **Relatórios mensais/trimestrais**
- [ ] **Comparação com benchmarks**
- [ ] **Alertas automáticos**
- [ ] **Export para PDF/Excel**

**Arquivos**:
- `backend/controllers/indicators.js`
- `backend/models/indicator.js`
- `frontend/components/indicators/`

---

### ⚖️ **3. ESCALAS MRC E BARTHEL** - **AVALIAÇÃO CLÍNICA**
**Status**: ⏳ A implementar
**Descrição**: Escalas padronizadas para avaliação de pacientes

**Escala MRC (Medical Research Council)**:
- [ ] **Interface de avaliação muscular**
- [ ] **Graduação 0-5 por grupo muscular**
- [ ] **Cálculo automático do score total**
- [ ] **Histórico de avaliações**
- [ ] **Gráficos de evolução**

**Escala Barthel (Índice de Independência)**:
- [ ] **10 atividades de vida diária**
- [ ] **Pontuação 0-100**
- [ ] **Classificação automática (dependência)**
- [ ] **Comparação temporal**
- [ ] **Relatório de evolução**

**Arquivos**:
- `backend/controllers/mrc-scale.js`
- `backend/controllers/barthel-scale.js`
- `frontend/components/scales/`

---

### 📝 **4. EVOLUÇÕES DE FISIOTERAPIA** - **REGISTRO CLÍNICO**
**Status**: ⏳ A implementar
**Descrição**: Sistema completo de evoluções médicas/fisioterapêuticas

**Funcionalidades**:
- [ ] **Editor rich text para evoluções**
- [ ] **Templates predefinidos**
- [ ] **Anexos (imagens, documentos)**
- [ ] **Assinatura digital**
- [ ] **Histórico completo por paciente**
- [ ] **Busca por palavras-chave**
- [ ] **Relatório consolidado**

**Campos das Evoluções**:
- [ ] Data/hora da evolução
- [ ] Fisioterapeuta responsável
- [ ] Avaliação clínica
- [ ] Condutas realizadas
- [ ] Metas/objetivos
- [ ] Observações
- [ ] Próximos passos

**Arquivos**:
- `backend/controllers/evolutions.js`
- `backend/models/evolution.js`
- `frontend/components/evolutions/`

---

### 👨‍⚕️ **5. GERENCIAMENTO DE FISIOTERAPEUTAS** - **USUÁRIOS**
**Status**: ⏳ A implementar
**Descrição**: Sistema de usuários com diferentes níveis de acesso

**Tipos de Usuário**:
- [ ] **Admin do Tenant** (Hospital)
- [ ] **Fisioterapeuta Sênior**
- [ ] **Fisioterapeuta Pleno**
- [ ] **Fisioterapeuta Júnior**
- [ ] **Estagiário** (apenas leitura)

**Funcionalidades**:
- [ ] **Criação de contas pelo Admin**
- [ ] **Convites automáticos por email**
- [ ] **Definição de permissões por papel**
- [ ] **Gestão de equipes**
- [ ] **Relatório de atividades**

**Convites Automáticos**:
- [ ] **Email com credenciais temporárias**
- [ ] **Link seguro para primeiro acesso**
- [ ] **Obrigatoriedade de trocar senha**
- [ ] **Tutorial de boas-vindas**

**Arquivos**:
- `backend/controllers/staff.js`
- `backend/services/invitation-email.js`
- `frontend/components/staff-management/`

---

## 🗄️ **ESTRUTURA DO BANCO DE DADOS**

### **Novas Tabelas Necessárias**:

```sql
-- Email Verification
CREATE TABLE email_verifications (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  tenant_id VARCHAR(255),
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indicators
CREATE TABLE indicators (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  patient_id VARCHAR(255),
  type VARCHAR(100) NOT NULL, -- 'mobilization', 'ventilation', etc
  value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit VARCHAR(50),
  measurement_date TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- MRC Scale Results
CREATE TABLE mrc_evaluations (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  evaluated_by VARCHAR(255) NOT NULL,
  total_score INT,
  evaluation_data JSONB, -- Store detailed muscle group scores
  evaluation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Barthel Scale Results  
CREATE TABLE barthel_evaluations (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  evaluated_by VARCHAR(255) NOT NULL,
  total_score INT,
  dependency_level VARCHAR(50), -- 'independent', 'mild', 'moderate', 'severe'
  evaluation_data JSONB, -- Store detailed activity scores
  evaluation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Evolutions
CREATE TABLE evolutions (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  therapist_id VARCHAR(255) NOT NULL,
  evolution_type VARCHAR(50) DEFAULT 'physiotherapy',
  clinical_assessment TEXT,
  conducted_procedures TEXT,
  goals_objectives TEXT,
  observations TEXT,
  next_steps TEXT,
  attachments JSONB,
  evolution_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff/Therapists
CREATE TABLE staff_members (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL, -- Reference to global_users
  specialization VARCHAR(100),
  license_number VARCHAR(100),
  role VARCHAR(50), -- 'senior', 'pleno', 'junior', 'intern'
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📅 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **🚀 SPRINT 1 - Sistema de Email (1-2 dias)**
- [x] ~~Setup SMTP/SendGrid~~
- [ ] Email verification service
- [ ] Frontend de verificação
- [ ] Testes de envio

### **📊 SPRINT 2 - Base dos Indicadores (2-3 dias)**  
- [ ] Schema de indicadores
- [ ] API básica (CRUD)
- [ ] Dashboard inicial
- [ ] Componentes de gráficos

### **⚖️ SPRINT 3 - Escalas de Avaliação (2-3 dias)**
- [ ] Interface da Escala MRC
- [ ] Interface da Escala Barthel
- [ ] Cálculos automáticos
- [ ] Histórico de avaliações

### **📝 SPRINT 4 - Evoluções (2-3 dias)**
- [ ] Editor de evoluções
- [ ] Templates clínicos
- [ ] Sistema de anexos
- [ ] Relatórios

### **👨‍⚕️ SPRINT 5 - Gestão de Usuários (1-2 dias)**
- [ ] Convites automáticos
- [ ] Gestão de permissões
- [ ] Interface de administração

### **🎯 SPRINT 6 - Integração e Testes (1-2 dias)**
- [ ] Testes de integração
- [ ] Refinamentos UX
- [ ] Deploy de produção
- [ ] Documentação final

---

## 🎯 **ENTREGÁVEIS PARA O HOSPITAL GALILEU**

### **✅ Sistema Completo Funcional**:
1. **Autenticação segura** com verificação de email
2. **Dashboard de indicadores** em tempo real  
3. **Escalas MRC e Barthel** implementadas
4. **Sistema de evoluções** completo
5. **Gestão de fisioterapeutas** com convites
6. **Relatórios exportáveis** (PDF/Excel)
7. **Interface responsiva** para tablets/mobile
8. **Sistema de segurança** completo (já implementado)

### **📊 Métricas de Sucesso**:
- Login seguro em < 30 segundos
- Dashboard carrega em < 3 segundos
- Escalas preenchidas em < 5 minutos
- Evoluções salvas em tempo real
- 99.9% uptime do sistema

---

## 🔧 **CONFIGURAÇÃO TÉCNICA**

### **Backend Stack**:
- ✅ Node.js + Express + Prisma
- ✅ PostgreSQL (Railway)
- ✅ JWT + Rate Limiting
- [ ] SendGrid/Resend (Email)
- [ ] Chart.js (Gráficos)

### **Frontend Stack**:  
- ✅ Next.js 14 + TypeScript
- ✅ Tailwind CSS + Radix UI
- ✅ React Context (Tenants)
- [ ] React Hook Form (Formulários)
- [ ] React Query (Cache)

### **Deploy**:
- ✅ Frontend: Vercel
- ✅ Backend: Railway 
- ✅ Database: PostgreSQL Railway
- [ ] Email: SendGrid/Resend
- [ ] Storage: Cloudinary (anexos)

---

**Status Atual**: 🟡 **60% Concluído**
**Prazo Final**: 📅 **Sexta-feira (entrega cliente)**
**Próximo passo**: 🔐 **Implementar verificação por email**