#!/bin/bash

echo "🚀 Iniciando deploy de homologação do FisioHub SaaS..."

# 1. Verificar se estamos na branch main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Erro: Deploy deve ser feito na branch main"
    exit 1
fi

# 2. Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "❌ Erro: Há mudanças não commitadas"
    echo "Execute: git add . && git commit -m 'Preparação para deploy'"
    exit 1
fi

# 3. Push para GitHub
echo "📤 Fazendo push para GitHub..."
git push origin main

# 4. Deploy do Frontend no Vercel
echo "🎨 Fazendo deploy do frontend no Vercel..."
cd frontend
vercel --prod --yes
cd ..

# 5. Configurar Railway (se primeira vez)
if [ ! -f "backend/.railway" ]; then
    echo "🚂 Configurando Railway pela primeira vez..."
    echo "Acesse: https://railway.app e conecte este repositório"
    echo "Configure as variáveis de ambiente conforme railway-setup.md"
fi

echo "✅ Deploy de homologação concluído!"
echo ""
echo "URLs de Homologação:"
echo "🌐 Frontend: https://staging.fisiohub.app"
echo "🔌 API: https://fisiohub-backend-staging.railway.app"
echo ""
echo "Próximos passos:"
echo "1. Testar todas as funcionalidades"
echo "2. Validar formulário de registro"
echo "3. Configurar domínios personalizados"
echo "4. Integrar AbacatePay"