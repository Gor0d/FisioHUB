# 🚀 FisioHub - Instruções para Execução Local

## ✅ Status Atual do Projeto

**O projeto já está configurado e funcionando!**

- ✅ Backend rodando em: http://localhost:3001
- ✅ Frontend rodando em: http://localhost:3000
- ✅ Banco SQLite configurado (`backend/prisma/dev.db`)
- ✅ API funcionando (teste: http://localhost:3001/health)

## 📁 Estrutura Criada

```
fisiohub/
├── backend/           # API Express + TypeScript ✅
│   ├── src/          # Código fonte
│   ├── prisma/       # Schema e migrations
│   └── dev.db        # Banco SQLite local
├── frontend/         # Next.js 14 + Tailwind ✅  
├── shared/           # Types compartilhados ✅
└── docs/            # Documentação
```

## 🎯 Funcionalidades Implementadas

### ✅ Backend (Express + TypeScript)
- Sistema de autenticação JWT + bcrypt
- CRUD completo de pacientes
- Sistema de agendamentos com validação
- Registro de evoluções por sessão
- Dashboard com métricas e estatísticas
- Middleware de autenticação e logs
- Validação com Zod

### ✅ Banco de Dados (SQLite + Prisma)
- Schema completo com relacionamentos
- Migrations configuradas
- Cliente Prisma gerado

### ✅ Tipos Compartilhados (TypeScript)
- Interfaces para todas as entidades
- Schemas de validação Zod
- Utilitários de formatação

### ✅ Frontend (Next.js 14)
- Estrutura com App Router
- Tailwind CSS configurado
- TypeScript configurado

## 🔧 Como Usar

### 1. Verificar se está funcionando
```bash
# Testar API
curl http://localhost:3001/health

# Acessar frontend
# Abrir http://localhost:3000 no navegador
```

### 2. Banco de dados
```bash
# Ver dados (Prisma Studio)
cd backend
npx prisma studio
# Abre em http://localhost:5555
```

### 3. Reiniciar serviços (se necessário)
```bash
# Backend
cd backend
npm run dev

# Frontend (novo terminal)
cd frontend  
npm run dev
```

## 📋 Endpoints da API

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

## 🧪 Testar a API

### Exemplo: Registrar usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. João","email":"joao@teste.com","password":"123456","crf":"12345"}'
```

### Exemplo: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","password":"123456"}'
```

## 🔄 Próximos Passos

1. **Frontend**: Criar páginas e componentes para as funcionalidades
2. **Autenticação**: Implementar login/logout no frontend
3. **CRUD**: Criar interfaces para gerenciar pacientes e agendamentos
4. **Dashboard**: Criar telas com gráficos e métricas
5. **Deploy**: Configurar para produção

## 🐛 Solução de Problemas

### Backend não inicia
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend não inicia  
```bash
cd frontend
npm install
npm run dev
```

### Banco zerado
```bash
cd backend
npx prisma migrate reset
```

## 🎉 Resultado

O projeto FisioHub está **funcionando localmente** com:
- API backend completa e testada
- Frontend básico configurado  
- Banco de dados com schema completo
- Sistema de autenticação seguro
- Todas as funcionalidades MVP implementadas

**Acesse http://localhost:3000 para ver o frontend!**