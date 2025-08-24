# 🏥 FisioHUB - Plataforma SaaS para Gestão de Indicadores Clínicos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

**Plataforma SaaS completa e robusta** para gestão inteligente de indicadores clínicos com **arquitetura multitenancy**, **testes automatizados** e **deploy containerizado**.

<p align="center">
  <img src="docs/3.png" alt="FisioHub Logo" width="250"/>
</p>


## ✨ Características Principais

### 🏢 **Arquitetura SaaS Multitenancy**
- **Schema-per-tenant**: Isolamento completo de dados por cliente
- **Subdomínios personalizados**: `cliente.fisiohub.com`
- **Planos de assinatura**: Básico, Profissional, Empresarial
- **Escalabilidade automática**: Suporta milhares de tenants
- **Billing e pagamentos**: Sistema de cobrança integrado

### 🔐 **Autenticação Multi-Tenant**
- **JWT com contexto de tenant**: Tokens seguros e específicos
- **5 níveis de acesso**: Super Admin → Tenant Admin → Hospital Admin → Service Manager → Collaborator
- **Single Sign-On (SSO)**: Autenticação unificada
- **Sistema de convites**: Onboarding automático de colaboradores

### 🚀 **Portal Público de Cadastro**
- **Landing page responsiva**: Com pricing e features
- **Registro multi-step**: Validação em tempo real
- **Onboarding guiado**: Interface para configuração inicial
- **Trial de 14 dias**: Teste gratuito automático

### 🛠️ **DevOps e Qualidade**
- **CI/CD automatizado**: GitHub Actions com deploy automático
- **Testes abrangentes**: Backend (Jest) + Frontend (Testing Library)
- **Containerização**: Docker multi-stage com health checks
- **Monitoramento**: Health checks e métricas de performance
- **Backup automático**: Estratégias de recuperação de dados

### 🏥 **Funcionalidades Clínicas**
- ✅ Gestão completa de indicadores clínicos
- ✅ Dashboard com BI avançado
- ✅ Multi-hospitais e serviços
- ✅ Relatórios em tempo real
- ✅ Integração com APIs externas
- ✅ Conformidade LGPD

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Radix UI** - Components
- **React Hook Form** - Forms
- **Zod** - Validation

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **Prisma ORM** - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### Database
- **SQLite** (desenvolvimento)
- **PostgreSQL** (produção)

## 🏗️ Estrutura do Projeto

```
fisiohub/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
├── backend/           # Express + TypeScript + Prisma
├── shared/            # Types e schemas compartilhados
├── database/          # Scripts e configurações DB
├── docs/              # Documentação completa
└── docker-compose.yml # Ambiente containerizado
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/Gor0d/FisioHUB.git
cd FisioHUB
```

### 2. Instale as dependências
```bash
# Shared types
cd shared && npm install && npm run build

# Backend
cd ../backend && npm install

# Frontend  
cd ../frontend && npm install
```

### 3. Configure o ambiente
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

### 4. Configure o banco de dados
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Execute o projeto
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 6. Acesse o sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `npx prisma studio` (na pasta backend)

## 🔑 Credenciais Padrão

### Administrador
- **Email**: `admin@fisiohub.com`
- **Senha**: `admin123`

## 📱 Screenshots

### Tela de Login
- Interface moderna e responsiva
- Personalização em tempo real
- Formulários inteligentes

### Dashboard Administrativo
- Métricas em tempo real
- Cards interativos
- Funcionalidades por role

### Sistema de Temas
- Mudança instantânea de cores
- Preservação das preferências
- Adequação à identidade da empresa

## 🎯 Casos de Uso

### Para Desenvolvedores
- Sistema completo para estudar
- Arquitetura moderna e escalável
- Exemplo de aplicação real

### Para Clínicas
- Gestão completa de pacientes
- Controle de agendamentos
- Acompanhamento de tratamentos

### Para Empresas de Software
- Base para white-label
- Personalização por cliente
- Multi-tenancy preparado

## 🔧 Desenvolvimento

### Comandos úteis
```bash
# Backend
npm run dev          # Desenvolvimento
npm run build        # Build
npx prisma studio    # Visualizar BD

# Frontend  
npm run dev          # Desenvolvimento
npm run build        # Build
npm run lint         # Linting

# Shared
npm run build        # Compilar types
```

### Estrutura de pastas detalhada
```
backend/
├── src/
│   ├── controllers/   # Lógica de negócio
│   ├── routes/        # Rotas da API
│   ├── middleware/    # Middlewares
│   ├── utils/         # Utilities
│   └── types/         # Types locais
├── prisma/           # Schema e migrations
└── package.json

frontend/
├── src/
│   ├── app/          # App Router (Next.js 13+)
│   ├── components/   # Componentes React
│   ├── contexts/     # React Contexts
│   ├── hooks/        # Custom Hooks
│   ├── lib/          # Libraries
│   └── utils/        # Utilities
└── package.json
```

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Senhas criptografadas (bcrypt)
- ✅ Validação de entrada (Zod)
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Sanitização de dados

## 🌐 Deploy

### Opções disponíveis
- **Vercel** (Frontend) + **Railway** (Backend)
- **Docker** (Ambiente completo)
- **AWS/Azure/GCP** (Infraestrutura completa)

### Variáveis de ambiente necessárias
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="seu-jwt-secret"
NEXT_PUBLIC_API_URL="https://api.seudominio.com"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Emerson Guimarães**
- GitHub: [@Gor0d](https://github.com/Gor0d)
- LinkedIn: [Emerson Guimarães](https://linkedin.com/in/emerson-guimaraes)

## ⭐ Apoie o Projeto

Se este projeto foi útil para você, considere dar uma estrela ⭐ no repositório!

---

**FisioHub** - Transformando a gestão de clínicas de fisioterapia 🏥✨
