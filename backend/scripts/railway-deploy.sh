#!/bin/bash

# Script de deploy para Railway
echo "🚀 Iniciando deploy para Railway..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# 2. Gerar Prisma Client
echo "🔄 Gerando Prisma Client..."
npx prisma generate

# 3. Executar migrações
echo "📊 Executando migrações do banco..."
npx prisma migrate deploy

# 4. Build da aplicação
echo "🔨 Fazendo build..."
npm run build

echo "✅ Deploy concluído com sucesso!"