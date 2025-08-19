# Setup Local - FisioHub

Como o Docker não está disponível, vamos configurar para execução local.

## 1. Pré-requisitos

### PostgreSQL
Baixe e instale o PostgreSQL:
- https://www.postgresql.org/download/windows/
- Durante a instalação, defina a senha como `postgres`
- Port padrão: 5432

### Node.js
Certifique-se que tem Node.js 18+ instalado:
```bash
node --version
npm --version
```

## 2. Configuração do Banco

Após instalar o PostgreSQL, crie o banco:

```sql
-- Conecte ao PostgreSQL como superuser
createdb fisiohub
```

Ou use o pgAdmin para criar um banco chamado `fisiohub`.

## 3. Configuração dos Pacotes

### Shared Types
```bash
cd shared
npm install
npm run build
```

### Backend
```bash
cd backend
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Executar servidor
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 4. Acessar a aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 5. Comandos úteis

```bash
# Ver banco de dados
cd backend
npx prisma studio

# Reset do banco
npx prisma migrate reset

# Logs do backend
npm run dev
```