# ☁️ Deploy na Azure - Print Cloud

Este guia detalha como fazer o deploy do Print Cloud na Azure usando os serviços PaaS mais adequados.

## 🏗️ Arquitetura Azure

### Serviços Utilizados

```
┌─────────────────────────────────────────────────────────────┐
│                        Azure Cloud                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Azure AD      │  │  Front Door     │  │   Key Vault │ │
│  │  (Autenticação) │  │  (CDN + WAF)    │  │ (Segredos)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                      │                 │       │
│           └──────────────────────┼─────────────────┘       │
│                                  │                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Container Apps Environment               │ │
│  │                                                       │ │
│  │  ┌─────────────────────────┐  ┌─────────────────────┐  │ │
│  │  │    Print Cloud App      │  │     Adminer        │  │ │
│  │  │     (Next.js)          │  │   (Opcional)       │  │ │
│  │  │                        │  │                     │  │ │
│  │  │  - Autenticação Azure  │  └─────────────────────┘  │ │
│  │  │  - API REST            │                           │ │
│  │  │  - Interface Web       │                           │ │
│  │  └─────────────────────────┘                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                               │
│  ┌─────────────────┐      │      ┌─────────────────────┐   │
│  │ Azure Database  │◄─────┴─────►│   Azure Cache       │   │
│  │  for PostgreSQL │              │   for Redis         │   │
│  │                 │              │                     │   │
│  │ - Backup auto   │              │ - Cache sessões    │   │
│  │ - Alta disponib │              │ - Cache dados      │   │
│  │ - Monitoramento │              │ - Pub/Sub          │   │
│  └─────────────────┘              └─────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Recursos Azure Necessários

#### 1. **Azure Container Apps** (Aplicação)
- **Função**: Hospedagem da aplicação Next.js
- **Vantagens**: 
  - Auto-scaling baseado em demanda
  - Deploy de containers sem gerenciar infraestrutura
  - Integração nativa com Azure AD
  - HTTPS automático

#### 2. **Azure Database for PostgreSQL**
- **Função**: Banco de dados principal
- **Configuração**:
  - Flexible Server (recomendado)
  - Backup automático (7-35 dias)
  - Alta disponibilidade opcional
  - Monitoramento integrado

#### 3. **Azure Cache for Redis**
- **Função**: Cache e sessões
- **Usos**:
  - Cache de consultas frequentes
  - Armazenamento de sessões
  - Real-time notifications

#### 4. **Azure Container Registry**
- **Função**: Registry privado para images Docker
- **Configuração**: 
  - Tier Basic/Standard
  - Integração com Container Apps
  - Scan de vulnerabilidades

#### 5. **Azure Key Vault**
- **Função**: Gerenciamento de segredos
- **Armazena**:
  - Strings de conexão
  - Chaves de API
  - Certificados SSL

#### 6. **Azure Front Door** (Opcional - Produção)
- **Função**: CDN + WAF + Load Balancer
- **Benefícios**:
  - Performance global
  - Proteção DDoS
  - SSL/TLS gerenciado

## 💰 Estimativa de Custos (Brasil Sul)

| Serviço | Configuração | Custo Mensal (USD) |
|---------|-------------|------------------|
| Container Apps | 1 GB RAM, 1 vCPU | ~$20-40 |
| PostgreSQL | 2 vCore, 8GB RAM | ~$80-120 |
| Redis Cache | Basic C1 (1GB) | ~$25-35 |
| Container Registry | Basic | ~$5 |
| Key Vault | Standard | ~$3 |
| Front Door (opcional) | Standard | ~$35 |
| **Total** | | **~$170-240/mês** |

*Preços estimados, podem variar conforme uso e região*

## 🚀 Deploy Step-by-Step

### Pré-requisitos
- Azure CLI instalado
- Subscription Azure ativa
- Docker instalado
- Permissões de Contributor na subscription

### 1. Preparação do Ambiente

```bash
# Login na Azure
az login

# Selecionar subscription
az account set --subscription "sua-subscription-id"

# Criar resource group
az group create \\
  --name rg-printcloud-prod \\
  --location "Brazil South"
```

### 2. Criar Azure Container Registry

```bash
# Criar registry
az acr create \\
  --resource-group rg-printcloud-prod \\
  --name printcloudregistry \\
  --sku Basic \\
  --admin-enabled true

# Obter credenciais
az acr credential show --name printcloudregistry
```

### 3. Build e Push da Imagem

```bash
# Build local
docker build -t printcloud:latest .

# Tag para registry
docker tag printcloud:latest printcloudregistry.azurecr.io/printcloud:latest

# Login no registry
az acr login --name printcloudregistry

# Push
docker push printcloudregistry.azurecr.io/printcloud:latest
```

### 4. Criar Banco PostgreSQL

```bash
# Criar servidor PostgreSQL
az postgres flexible-server create \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-db-prod \\
  --location "Brazil South" \\
  --admin-user printcloudadmin \\
  --admin-password "SuaSenhaSegura123!" \\
  --sku-name Standard_B2s \\
  --tier Burstable \\
  --storage-size 32 \\
  --version 14

# Criar database
az postgres flexible-server db create \\
  --resource-group rg-printcloud-prod \\
  --server-name printcloud-db-prod \\
  --database-name printcloud
```

### 5. Criar Redis Cache

```bash
# Criar Redis
az redis create \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-cache-prod \\
  --location "Brazil South" \\
  --sku Basic \\
  --vm-size c1
```

### 6. Criar Key Vault

```bash
# Criar Key Vault
az keyvault create \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-keyvault-prod \\
  --location "Brazil South"

# Adicionar segredos
az keyvault secret set \\
  --vault-name printcloud-keyvault-prod \\
  --name "DATABASE-URL" \\
  --value "postgresql://printcloudadmin:SuaSenhaSegura123!@printcloud-db-prod.postgres.database.azure.com/printcloud"

az keyvault secret set \\
  --vault-name printcloud-keyvault-prod \\
  --name "NEXTAUTH-SECRET" \\
  --value "seu-nextauth-secret-super-seguro"
```

### 7. Criar Container Apps Environment

```bash
# Criar environment
az containerapp env create \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-env-prod \\
  --location "Brazil South"
```

### 8. Deploy da Aplicação

```bash
# Criar Container App
az containerapp create \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-app-prod \\
  --environment printcloud-env-prod \\
  --image printcloudregistry.azurecr.io/printcloud:latest \\
  --registry-server printcloudregistry.azurecr.io \\
  --registry-username printcloudregistry \\
  --registry-password "senha-do-registry" \\
  --target-port 3000 \\
  --ingress external \\
  --min-replicas 1 \\
  --max-replicas 5 \\
  --cpu 1 \\
  --memory 2Gi \\
  --env-vars \\
    NODE_ENV=production \\
    DATABASE_URL=secretref:database-url \\
    NEXTAUTH_SECRET=secretref:nextauth-secret \\
    NEXT_PUBLIC_AZURE_AD_CLIENT_ID=seu-client-id \\
    NEXT_PUBLIC_AZURE_AD_TENANT_ID=seu-tenant-id \\
  --secrets \\
    database-url="postgresql://printcloudadmin:SuaSenhaSegura123!@printcloud-db-prod.postgres.database.azure.com/printcloud" \\
    nextauth-secret="seu-nextauth-secret-super-seguro"
```

### 9. Executar Migrations

```bash
# Obter URL da aplicação
WEBAPP_URL=$(az containerapp show \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-app-prod \\
  --query properties.configuration.ingress.fqdn \\
  --output tsv)

echo "App URL: https://$WEBAPP_URL"

# Executar migrations via container
az containerapp exec \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-app-prod \\
  --command "npx prisma migrate deploy"
```

## 🔄 CI/CD com GitHub Actions

### 1. Configurar Secrets no GitHub

No repositório GitHub, adicionar os secrets:

- `AZURE_CREDENTIALS` - Service Principal JSON
- `ACR_LOGIN_SERVER` - printcloudregistry.azurecr.io
- `ACR_USERNAME` - username do registry
- `ACR_PASSWORD` - password do registry
- `RESOURCE_GROUP` - rg-printcloud-prod
- `CONTAINER_APP_NAME` - printcloud-app-prod

### 2. Criar Service Principal

```bash
# Criar service principal
az ad sp create-for-rbac \\
  --name "printcloud-deploy" \\
  --role contributor \\
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-printcloud-prod \\
  --sdk-auth

# Copiar o JSON resultado para AZURE_CREDENTIALS
```

### 3. GitHub Actions Workflow

O arquivo `.github/workflows/azure-deploy.yml` já está configurado para:
- Build automático no push para main
- Deploy automático para Azure
- Execução de migrations
- Notificações de status

## 🔧 Configurações de Produção

### Variáveis de Ambiente

```env
# Produção
NODE_ENV=production
DATABASE_URL=secretref:database-url
REDIS_URL=secretref:redis-url
NEXTAUTH_URL=https://seu-app.brazilsouth.azurecontainerapps.io
NEXTAUTH_SECRET=secretref:nextauth-secret

# Azure AD
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=seu-client-id-prod
NEXT_PUBLIC_AZURE_AD_TENANT_ID=seu-tenant-id

# Opcionais
AZURE_STORAGE_CONNECTION_STRING=secretref:storage-connection
APPLICATIONINSIGHTS_CONNECTION_STRING=secretref:appinsights-connection
```

### Domínio Personalizado

```bash
# Adicionar domínio personalizado
az containerapp hostname add \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-app-prod \\
  --hostname printcloud.suaempresa.com

# Configurar certificado SSL
az containerapp ssl upload \\
  --resource-group rg-printcloud-prod \\
  --name printcloud-app-prod \\
  --hostname printcloud.suaempresa.com \\
  --certificate-file certificate.pfx \\
  --password "senha-certificado"
```

## 📊 Monitoramento e Logs

### Application Insights

```bash
# Criar Application Insights
az monitor app-insights component create \\
  --resource-group rg-printcloud-prod \\
  --app printcloud-insights-prod \\
  --location "Brazil South" \\
  --kind web
```

### Log Analytics

```bash
# Criar Log Analytics Workspace
az monitor log-analytics workspace create \\
  --resource-group rg-printcloud-prod \\
  --workspace-name printcloud-logs-prod \\
  --location "Brazil South"
```

## 🔒 Segurança

### Network Security
- Private endpoints para PostgreSQL e Redis
- Virtual Network integration
- WAF rules no Front Door

### Backup e Disaster Recovery
- Backup automático do PostgreSQL (7-35 dias)
- Replicação geo-redundante
- Export/import de Container Apps

### Compliance
- Audit logs habilitados
- Microsoft Defender for Cloud
- Compliance dashboard

## 🎯 Roadmap de Deploy

### Fase 1 - MVP
- [x] Container Apps + PostgreSQL + Redis
- [x] CI/CD básico
- [x] SSL/HTTPS

### Fase 2 - Produção
- [ ] Front Door + WAF
- [ ] Application Insights
- [ ] Backup/DR strategy
- [ ] Performance monitoring

### Fase 3 - Enterprise
- [ ] Multi-region deployment
- [ ] Private endpoints
- [ ] Advanced monitoring
- [ ] Auto-scaling rules

---

**Azure Architecture** ☁️  
Infraestrutura robusta e escalável para Print Cloud!