# 🚀 Deploy FisioHub SaaS - Railway

## Passos para Deploy de Homologação

### 1. Preparação do Repositório
```bash
git add .
git commit -m "Preparação para deploy de homologação"
git push origin main
```

### 2. Deploy Backend (Railway)
1. Acesse: https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório FisioHUB
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 3. Configurar Variáveis de Ambiente (Railway)
```env
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://username:password@hostname:5432/database
JWT_SECRET=your-super-secret-jwt-key-production
FRONTEND_URL=https://fisiohub-staging.vercel.app
```

### 4. Deploy Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### 5. Configurar Domínios
- **Homologação**: staging.fisiohub.app → Railway + Vercel
- **Produção**: fisiohub.app → Railway + Vercel
- **Marketing**: fisiohubtech.com.br → Vercel

### 6. Configurar PostgreSQL
Railway automaticamente provisionará um PostgreSQL quando detectar prisma

### 7. Configurar CORS
Backend já está configurado para múltiplos domínios

### 8. SSL
Railway e Vercel já incluem SSL automático

## URLs Finais
- **API Homologação**: https://fisiohub-backend-staging.railway.app
- **Frontend Homologação**: https://staging.fisiohub.app
- **API Produção**: https://fisiohub-backend.railway.app  
- **Frontend Produção**: https://fisiohub.app

## Custos Estimados
- Railway: $5-20/mês
- Vercel: Gratuito → $20/mês
- Domínios: $10-30/ano
- **Total**: ~$10-40/mês