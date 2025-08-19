# 🏥 FisioHub - Sistema de Gestão para Fisioterapeutas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

Sistema SaaS completo para gestão de clínicas de fisioterapia com **interface personalizável** e **sistema multi-usuário**.

![FisioHub Logo](docs/3.png)

## ✨ Características Principais

### 🎨 **Sistema White-Label**
- **Temas personalizáveis**: 3 temas prontos (Default, Medical, Corporate)
- **Branding flexível**: Nome da empresa + logo FisioHub
- **Cores adaptáveis**: Interface que se adapta à identidade visual do cliente

### 👥 **Multi-Usuário**
- **Administrador**: Controle total do sistema
- **Fisioterapeuta**: Gestão de pacientes e tratamentos
- **Recepcionista**: Agendamentos e cadastros

### 🏥 **Funcionalidades Clínicas**
- ✅ Gestão completa de pacientes
- ✅ Sistema de agendamentos inteligente
- ✅ Registro detalhado de evoluções
- ✅ Dashboard com métricas em tempo real
- ✅ Relatórios gerenciais

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
