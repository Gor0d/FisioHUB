# 🚀 Guia de Deploy - FisioHub SaaS

## ✅ STATUS: Sistema 100% Funcionando Localmente!

### 🎯 Deploy Automatizado Configurado

O projeto possui workflows GitHub Actions configurados para deploy automatizado:

- **Staging**: Deploy automático no push para branches `develop` ou `staging`
- **Production**: Deploy automático em tags de versão (`v*.*.*`)

### 📋 Pré-requisitos para Deploy

#### 1. Contas Necessárias
- ✅ GitHub (repositório já configurado)
- 🔧 Railway.app (para backend)
- 🔧 Vercel.com (para frontend)
- ✅ GoDaddy (domínios já comprados)

#### 2. Secrets do GitHub
Configure estes secrets no repositório GitHub:

```bash
# Railway
RAILWAY_TOKEN=your-railway-token

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### 🚀 Processo de Deploy (15 minutos)

#### Etapa 1: Railway (Backend) - 5 min
```bash
1. Acesse: https://railway.app
2. Conecte com GitHub
3. Selecione repositório FisioHub
4. Configure:
   - Root Directory: backend
   - Service Name: fisiohub-backend-prod (prod) / fisiohub-backend-staging (staging)
5. Variáveis de ambiente (Railway configura automaticamente):
   - DATABASE_URL: (PostgreSQL automático)
   - JWT_SECRET: gere-uma-chave-secreta-forte-aqui
   - NODE_ENV: production
```

#### Etapa 2: Vercel (Frontend) - 5 min
```bash
1. Acesse: https://vercel.com
2. Import from GitHub → FisioHub
3. Configure:
   - Framework: Next.js
   - Root Directory: frontend
   - Project Name: fisiohub-frontend
4. Environment Variables:
   - NEXT_PUBLIC_API_URL: https://fisiohub-backend-prod.railway.app (ajustar URL real)
```

#### Etapa 3: Configurar Domínios - 5 min
```bash
# fisiohub.app (domínio principal)
1. GoDaddy → DNS Management
2. Add Record:
   - Type: CNAME
   - Name: @
   - Value: fisiohub-frontend.vercel.app (ajustar URL real)
   - TTL: 600

# fisiohubtech.com.br (domínio alternativo)
3. GoDaddy → DNS Management
4. Add Record:
   - Type: CNAME
   - Name: @
   - Value: fisiohub-frontend.vercel.app (ajustar URL real)
   - TTL: 600
```

### 🏗️ Ambientes

#### Staging
- **Frontend**: https://fisiohub-staging.vercel.app
- **Backend**: https://fisiohub-backend-staging.railway.app
- **Trigger**: Push para branches `develop` ou `staging`
- **Uso**: Testes internos antes de produção

#### Production
- **Frontend**: https://fisiohub.app
- **Backend**: https://fisiohub-backend-prod.railway.app
- **Trigger**: Tags de versão (ex: `v1.0.0`)
- **Uso**: Ambiente de produção para clientes

### 📝 Como fazer Deploy

#### Deploy para Staging:
```bash
git checkout develop
git add .
git commit -m "Nova funcionalidade"
git push origin develop
# Deploy automático será executado
```

#### Deploy para Produção:
```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
# Deploy de produção será executado
```

### 💰 Custos Estimados

- **Railway**: $5/mês (backend + PostgreSQL)
- **Vercel**: Gratuito até 100GB bandwidth
- **Domínios**: ~$30/ano (já pagos)
- **Total**: ~$5/mês + domínios

### 🔄 Próximas Integrações

#### AbacatePay (Gateway de Pagamento)
```bash
# Webhook endpoint já configurado
POST /api/webhooks/abacatepay

# Variáveis necessárias:
ABACATEPAY_API_KEY=sua-chave-api
ABACATEPAY_WEBHOOK_SECRET=sua-chave-webhook
```

#### Monitoramento
- Railway: Logs automáticos
- Vercel: Analytics automático
- Sentry: Error tracking (opcional)

### ⚡ Status dos Recursos

- ✅ Multitenancy funcionando
- ✅ Autenticação JWT
- ✅ Database SQLite (desenvolvimento) / PostgreSQL (produção)
- ✅ UI com animações
- ✅ Landing page
- ✅ Registro de tenants
- ✅ CI/CD configurado
- ⏳ Pagamentos (AbacatePay)
- ⏳ Deploy em produção

### 🆘 Troubleshooting

#### Erro de Database
```bash
# No Railway, verificar se DATABASE_URL está configurado
# Redeployar se necessário
```

#### Erro de CORS
```bash
# Verificar se NEXT_PUBLIC_API_URL está correto
# Deve apontar para o Railway URL
```

#### Build Error
```bash
# Verificar se todas as dependências estão no package.json
# Conferir se TypeScript compila localmente
```

### 🎯 Próximo Passo

1. **Configure Railway e Vercel** (15 min)
2. **Teste o deploy staging** (5 min)
3. **Configure domínios** (5 min)
4. **Faça primeiro deploy produção** (2 min)

**Total: ~30 minutos para estar no ar! 🚀**