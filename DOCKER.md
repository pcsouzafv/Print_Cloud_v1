# 🐳 Ambiente Docker - Print Cloud

Este guia explica como executar o Print Cloud em um ambiente Docker completo para testes.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose v2 ou superior
- Pelo menos 4GB de RAM disponível
- Portas 3000, 5432, 6379, 8080 livres

## 🚀 Inicio Rápido

### Windows
```bash
# Executar script automatizado
docker\start.bat
```

### Linux/MacOS
```bash
# Dar permissão de execução
chmod +x docker/start.sh

# Executar script automatizado
./docker/start.sh
```

### Manual
```bash
# 1. Configurar variáveis de ambiente
cp .env.docker .env

# 2. Construir e iniciar serviços
docker-compose up -d

# 3. Aguardar PostgreSQL (30-60 segundos)

# 4. Executar migrations
docker-compose exec app npx prisma migrate deploy

# 5. Popular dados de teste
docker-compose exec app npm run db:seed
```

## 🛠️ Serviços Incluídos

### 📱 Aplicação Principal
- **URL**: http://localhost:3000
- **Container**: `printcloud-app`
- **Tecnologia**: Next.js 14 + TypeScript

### 🗄️ Banco de Dados
- **URL**: localhost:5432
- **Container**: `printcloud-postgres`
- **Usuário**: `printcloud`
- **Senha**: `printcloud123`
- **Database**: `printcloud`

### 🔧 Adminer (Gerenciador DB)
- **URL**: http://localhost:8080
- **Container**: `printcloud-adminer`
- **Acesso**:
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuário: printcloud
  - Senha: printcloud123
  - Base: printcloud

### ⚡ Redis (Cache)
- **URL**: localhost:6379
- **Container**: `printcloud-redis`
- **Senha**: `redis123`

## 🔑 Configuração Azure AD

Para testar a autenticação Azure AD, você precisa:

1. **Registrar aplicação no Azure Portal**:
   - Acesse [Azure Portal](https://portal.azure.com)
   - Azure Active Directory > App registrations
   - New registration:
     - Nome: "Print Cloud - Dev"
     - Redirect URI: `http://localhost:3000`

2. **Configurar variáveis**:
   Edite `.env` com os valores reais:
   ```env
   AZURE_AD_CLIENT_ID="seu-client-id-aqui"
   AZURE_AD_TENANT_ID="seu-tenant-id-aqui"
   ```

3. **Reiniciar aplicação**:
   ```bash
   docker-compose restart app
   ```

## 📊 Dados de Teste

O sistema vem pré-populado com:

### 👥 Usuários
- **admin@empresa.com** (ADMIN)
- **joao.silva@empresa.com** (USER)
- **maria.santos@empresa.com** (MANAGER)
- **carlos.oliveira@empresa.com** (USER)
- **ana.costa@empresa.com** (MANAGER)

### 🖨️ Impressoras
- **HP LaserJet Pro M404dn** (Administração - P&B)
- **Canon ImageRunner C3226i** (Marketing - Colorida)
- **Xerox VersaLink C405** (Vendas - Colorida)
- **Brother HL-L6400DW** (Financeiro - P&B)
- **Epson EcoTank L15150** (TI - Colorida)

### 🏢 Departamentos
- TI, Marketing, Vendas, Financeiro, Administração

## 🐛 Comandos Úteis

### Ver logs da aplicação
```bash
docker-compose logs -f app
```

### Ver logs de todos os serviços
```bash
docker-compose logs -f
```

### Executar migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Reset do banco de dados
```bash
docker-compose exec app npx prisma migrate reset --force
docker-compose exec app npm run db:seed
```

### Acessar container da aplicação
```bash
docker-compose exec app sh
```

### Acessar PostgreSQL
```bash
docker-compose exec postgres psql -U printcloud -d printcloud
```

### Parar todos os serviços
```bash
docker-compose down
```

### Parar e remover volumes (reset completo)
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar se PostgreSQL está rodando
docker-compose ps postgres
```

### Erro de conexão com banco
```bash
# Testar conexão
docker-compose exec postgres pg_isready -U printcloud

# Recriar banco
docker-compose down postgres
docker volume rm printcloud_postgres_data
docker-compose up -d postgres
```

### Porta já em uso
```bash
# Verificar processos usando as portas
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Parar todos os containers Docker
docker stop $(docker ps -q)
```

### Problemas de memória
```bash
# Limpar containers e imagens não utilizadas
docker system prune -f
docker image prune -f
```

## 🏗️ Desenvolvimento

### Fazer alterações no código
1. Editar arquivos localmente
2. Rebuild container:
   ```bash
   docker-compose build app
   docker-compose up -d app
   ```

### Adicionar nova dependência
1. Editar `package.json`
2. Rebuild:
   ```bash
   docker-compose build app --no-cache
   ```

### Executar comandos na aplicação
```bash
# Instalar dependências
docker-compose exec app npm install

# Executar lint
docker-compose exec app npm run lint

# Executar build
docker-compose exec app npm run build
```

## 📈 Monitoramento

### Health Check
- **URL**: http://localhost:3000/api/health
- **Resposta esperada**: `{"status":"healthy"}`

### Métricas do banco
```sql
-- No Adminer ou psql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables;
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Este ambiente é apenas para desenvolvimento/teste!

- Senhas padrão estão expostas
- Não usar em produção
- Alterar todas as credenciais antes do deploy

---

**Print Cloud Docker Environment** 🚀
Ambiente completo de desenvolvimento containerizado!