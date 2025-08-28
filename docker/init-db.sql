-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar usuário adicional para desenvolvimento (opcional)
-- CREATE USER printcloud_dev WITH PASSWORD 'dev123';
-- GRANT ALL PRIVILEGES ON DATABASE printcloud TO printcloud_dev;

-- Log de inicialização
INSERT INTO pg_catalog.pg_stat_statements_info VALUES (now(), 'Database initialized for Print Cloud')
ON CONFLICT DO NOTHING;