-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- Criação do banco (caso não exista)
SELECT 'CREATE DATABASE fisiohub'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fisiohub');