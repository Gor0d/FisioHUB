# FisioHub - Documentação

## 📋 Visão Geral

O FisioHub é uma plataforma SaaS completa para gestão de clínicas de fisioterapia, oferecendo ferramentas para:

- Gestão de pacientes
- Agendamento de sessões
- Registro de evoluções
- Dashboard com métricas
- Sistema de autenticação seguro

## 🏗️ Arquitetura

### Backend (Node.js + Express + TypeScript)
- **API REST** com autenticação JWT
- **Prisma ORM** para interação com PostgreSQL
- **Validação** com Zod
- **Segurança** com bcrypt para senhas

### Frontend (Next.js 14 + TypeScript)
- **App Router** (Next.js 13+)
- **Tailwind CSS** para styling
- **React Hook Form** para formulários
- **Axios** para requisições HTTP

### Banco de Dados (PostgreSQL)
- **Prisma** como ORM
- **Migrations** para versionamento
- **Seeds** para dados iniciais

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (ou usar Docker)

### 1. Clone e configure
```bash
git clone <repo-url>
cd fisiohub
cp .env.example .env
```

### 2. Usando Docker (Recomendado)
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Desenvolvimento local

#### Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Shared Types
```bash
cd shared
npm install
npm run build
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/:id` - Buscar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Remover paciente

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/:id` - Buscar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Remover agendamento

### Evoluções
- `GET /api/evolutions` - Listar evoluções
- `POST /api/evolutions` - Criar evolução
- `GET /api/evolutions/:id` - Buscar evolução
- `PUT /api/evolutions/:id` - Atualizar evolução
- `DELETE /api/evolutions/:id` - Remover evolução

### Dashboard
- `GET /api/dashboard/stats` - Métricas gerais
- `GET /api/dashboard/upcoming-appointments` - Próximos agendamentos
- `GET /api/dashboard/recent-evolutions` - Evoluções recentes

## 🔧 Scripts úteis

### Backend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

# Testes
npm test
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start

# Lint
npm run lint
```

## 📊 Banco de Dados

### Modelos principais
- **User**: Fisioterapeutas/usuários do sistema
- **Patient**: Pacientes da clínica
- **Appointment**: Agendamentos/sessões
- **Evolution**: Registros de evolução

### Relacionamentos
- User → Patients (1:N)
- User → Appointments (1:N)
- Patient → Appointments (1:N)
- Appointment → Evolution (1:1)

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Senhas hasheadas com bcrypt (salt 12)
- Validação de entrada com Zod
- Headers de segurança com Helmet
- CORS configurado

## 🚀 Deploy

### Usando Docker
```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de ambiente necessárias
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/fisiohub"
JWT_SECRET="seu-jwt-secret-super-seguro"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="https://api.fisiohub.com"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.