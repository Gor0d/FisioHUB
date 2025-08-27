# 📋 PRÓXIMAS TAREFAS - HOSPITAL GALILEU

## 🎯 ALTA PRIORIDADE (1-2 DIAS)

### 1. 📝 **Componentes Frontend para Escalas MRC/Barthel**
**Status**: ⏳ **URGENTE**  
**Tempo estimado**: 3-4 horas  

```bash
# Arquivos necessários:
frontend/src/components/assessments/
├── assessment-form.tsx        # Modal para criar avaliações MRC/Barthel
├── assessment-history.tsx     # Histórico de avaliações por paciente  
├── assessment-chart.tsx       # Gráficos de evolução das escalas
└── mrc-scale-form.tsx         # Form específico escala MRC
└── barthel-scale-form.tsx     # Form específico índice Barthel
```

**Descrição**:
- Modal com abas para MRC e Barthel
- Interface específica para cada grupo muscular (MRC)
- Interface para atividades de vida diária (Barthel)
- Cálculo automático de pontuações
- Validação de campos obrigatórios
- Integração com API backend já implementada

---

### 2. 📖 **Sistema Completo de Evoluções de Fisioterapia**
**Status**: ⏳ **URGENTE**  
**Tempo estimado**: 4-5 horas  

```bash
# Arquivos necessários:
frontend/src/app/t/[slug]/evolutions/
└── page.tsx                   # Página principal de evoluções

frontend/src/components/evolutions/
├── evolution-form.tsx         # Modal criar/editar evolução
├── evolution-list.tsx         # Lista com filtros avançados
├── evolution-templates.tsx    # Seleção de templates
├── evolution-viewer.tsx       # Visualizar evolução completa
├── soap-form.tsx             # Form específico SOAP
└── template-selector.tsx      # Seletor de tipos de evolução
```

**Funcionalidades necessárias**:
- Lista de evoluções com filtros (tipo, categoria, data, fisioterapeuta)
- Modal para criar evolução com templates dinâmicos
- Editor específico para método SOAP
- Visualizador de evolução com dados estruturados
- Histórico completo por paciente
- Estatísticas por fisioterapeuta

---

### 3. 👥 **Gerenciamento de Fisioterapeutas**
**Status**: ⏳ **IMPORTANTE**  
**Tempo estimado**: 3-4 horas  

```bash
# Backend:
backend/controllers/staff.js   # CRUD fisioterapeutas + convites

# Frontend:
frontend/src/app/t/[slug]/staff/
└── page.tsx                   # Página gerenciamento equipe

frontend/src/components/staff/
├── staff-list.tsx            # Lista de fisioterapeutas
├── staff-invite-form.tsx     # Modal convite por email
├── staff-edit-form.tsx       # Modal edição de dados
└── staff-stats.tsx           # Estatísticas da equipe
```

**Funcionalidades**:
- Lista de fisioterapeutas ativos
- Convidar novos membros por email
- Envio automático de credenciais
- Gerenciar roles e permissões
- Estatísticas de produtividade

---

## 🔧 MELHORIAS TÉCNICAS IMPORTANTES

### 4. 🗄️ **Database Migration & Deploy**
**Status**: ⏳ **CRÍTICO**  
**Tempo estimado**: 1 hora  

```bash
# Comandos necessários:
cd backend
npx prisma migrate dev --name "add-assessments-indicators-evolutions"
npx prisma generate
npm run railway:build
```

**Tarefas**:
- Executar migration das novas tabelas
- Verificar conectividade Railway
- Testar endpoints em produção
- Popular dados de teste

---

### 5. 📧 **Sistema de Convites por Email**
**Status**: ⏳ **IMPORTANTE**  
**Tempo estimado**: 2-3 horas  

**Backend necessário**:
- Endpoint para envio de convites
- Template de email para fisioterapeutas
- Sistema de tokens temporários
- Integração com email service existente

**Frontend necessário**:
- Modal de convite na página de staff
- Formulário com validação
- Lista de convites pendentes
- Reenvio de convites

---

## 🎨 MELHORIAS DE UX (MÉDIA PRIORIDADE)

### 6. 📊 **Componentes de Visualização de Dados**
**Status**: 📋 **PLANEJADO**  
**Tempo estimado**: 3-4 horas  

- Gráficos para tendências de indicadores
- Charts de evolução MRC/Barthel
- Dashboard com métricas visuais
- Exportação de relatórios

### 7. 🔔 **Sistema de Notificações**
**Status**: 📋 **PLANEJADO**  
**Tempo estimado**: 2-3 horas  

- Toast notifications profissionais
- Alertas para metas não atingidas
- Notificações de novos pacientes
- Sistema de lembretes

---

## 🚀 FUNCIONALIDADES AVANÇADAS (BAIXA PRIORIDADE)

### 8. 📈 **Relatórios Avançados**
- Exportação PDF/Excel
- Relatórios personalizados
- Dashboard executivo
- Indicadores comparativos

### 9. 🔒 **Sistema de Permissões**
- Roles diferenciados (admin, fisio, viewer)
- Controle de acesso por funcionalidade
- Auditoria de ações
- Log de atividades

### 10. 📱 **Otimizações Mobile**
- Interface mobile específica
- PWA (Progressive Web App)
- Notificações push
- Modo offline

---

## ⚡ PLANO DE EXECUÇÃO SUGERIDO

### **DIA 1 (Hoje/Amanhã)**
1. ✅ **Revisar sistema com cliente** (30min)
2. ⏳ **Implementar assessment forms** (3h)
3. ⏳ **Página de evoluções básica** (2h)
4. ⏳ **Database migration** (1h)

### **DIA 2**
1. ⏳ **Sistema completo de evoluções** (4h)
2. ⏳ **Testes integração** (1h)
3. ⏳ **Gerenciamento fisioterapeutas** (3h)

### **DIA 3**
1. ⏳ **Sistema de convites** (3h)
2. ⏳ **Melhorias UX** (2h)
3. ⏳ **Testes finais** (2h)
4. ⏳ **Treinamento cliente** (1h)

---

## 🎯 CRITÉRIOS DE SUCESSO

### **Para considerar o Hospital Galileu 100% pronto**:

✅ **Backend**: Todos os endpoints funcionando  
⏳ **Frontend**: Todas as páginas/modals implementados  
⏳ **Database**: Tabelas criadas e populadas  
⏳ **Testes**: Fluxos principais validados  
⏳ **Deploy**: Sistema estável em produção  
⏳ **Documentação**: Manual de uso criado  

---

## 🔗 LINKS ÚTEIS

- **Sistema atual**: https://fisiohub.app/t/0li0k7HNQslV
- **API**: https://api.fisiohub.app
- **Repositório**: Local (precisa push)
- **Documentação**: HOSPITAL-GALILEU-IMPLEMENTADO.md

---

**⏰ Última atualização**: 27/08/2025  
**📊 Status geral**: 70% implementado  
**🎯 Próximo milestone**: Components frontend (assessment + evolution forms)