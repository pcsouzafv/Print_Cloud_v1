#!/bin/bash

# Deploy script para Azure - Print Cloud
# Execute este script para fazer deploy completo na Azure

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configurações padrão (podem ser alteradas)
RESOURCE_GROUP=${RESOURCE_GROUP:-"rg-printcloud-prod"}
LOCATION=${LOCATION:-"Brazil South"}
APP_NAME=${APP_NAME:-"printcloud-app-prod"}
DB_NAME=${DB_NAME:-"printcloud-db-prod"}
REDIS_NAME=${REDIS_NAME:-"printcloud-cache-prod"}
REGISTRY_NAME=${REGISTRY_NAME:-"printcloudregistry"}
KEYVAULT_NAME=${KEYVAULT_NAME:-"printcloud-keyvault-prod"}
CONTAINER_ENV=${CONTAINER_ENV:-"printcloud-env-prod"}

# Verificar se está logado na Azure
print_step "Verificando login Azure CLI..."
if ! az account show > /dev/null 2>&1; then
    print_error "Não está logado na Azure CLI. Execute 'az login' primeiro."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id --output tsv)
print_success "Logado na subscription: $SUBSCRIPTION_ID"

# Verificar se o resource group existe
print_step "Verificando/criando Resource Group..."
if ! az group show --name $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Resource Group: $RESOURCE_GROUP"
    az group create --name $RESOURCE_GROUP --location "$LOCATION"
    print_success "Resource Group criado"
else
    print_success "Resource Group já existe"
fi

# Criar Container Registry
print_step "Configurando Azure Container Registry..."
if ! az acr show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Container Registry: $REGISTRY_NAME"
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $REGISTRY_NAME \
        --sku Basic \
        --admin-enabled true
    print_success "Container Registry criado"
else
    print_success "Container Registry já existe"
fi

# Obter credenciais do registry
REGISTRY_SERVER=$(az acr show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)
REGISTRY_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username --output tsv)
REGISTRY_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value --output tsv)

print_success "Registry: $REGISTRY_SERVER"

# Build e push da imagem
print_step "Build e push da imagem Docker..."
docker build -t printcloud:latest .
docker tag printcloud:latest $REGISTRY_SERVER/printcloud:latest

print_step "Fazendo login no registry..."
echo $REGISTRY_PASSWORD | docker login $REGISTRY_SERVER --username $REGISTRY_USERNAME --password-stdin

print_step "Fazendo push da imagem..."
docker push $REGISTRY_SERVER/printcloud:latest
print_success "Imagem enviada para o registry"

# Criar Key Vault
print_step "Configurando Azure Key Vault..."
if ! az keyvault show --name $KEYVAULT_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Key Vault: $KEYVAULT_NAME"
    az keyvault create \
        --resource-group $RESOURCE_GROUP \
        --name $KEYVAULT_NAME \
        --location "$LOCATION"
    print_success "Key Vault criado"
else
    print_success "Key Vault já existe"
fi

# Criar PostgreSQL Database
print_step "Configurando Azure Database for PostgreSQL..."
if ! az postgres flexible-server show --name $DB_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_warning "Criando PostgreSQL Server: $DB_NAME (isso pode demorar alguns minutos...)"
    
    # Gerar senha aleatória se não fornecida
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        print_warning "Senha gerada automaticamente. Será armazenada no Key Vault."
    fi
    
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_NAME \
        --location "$LOCATION" \
        --admin-user printcloudadmin \
        --admin-password "$DB_PASSWORD" \
        --sku-name Standard_B2s \
        --tier Burstable \
        --storage-size 32 \
        --version 14 \
        --yes
        
    # Criar database
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $DB_NAME \
        --database-name printcloud
    
    print_success "PostgreSQL criado"
else
    print_success "PostgreSQL já existe"
    # Se existe, tentar obter a senha do Key Vault
    if az keyvault secret show --vault-name $KEYVAULT_NAME --name "db-password" > /dev/null 2>&1; then
        DB_PASSWORD=$(az keyvault secret show --vault-name $KEYVAULT_NAME --name "db-password" --query value --output tsv)
    else
        print_error "PostgreSQL existe mas senha não encontrada no Key Vault. Defina DB_PASSWORD."
        exit 1
    fi
fi

# Obter connection string
DB_SERVER=$(az postgres flexible-server show --name $DB_NAME --resource-group $RESOURCE_GROUP --query fullyQualifiedDomainName --output tsv)
DATABASE_URL="postgresql://printcloudadmin:$DB_PASSWORD@$DB_SERVER/printcloud?sslmode=require"

# Criar Redis Cache
print_step "Configurando Azure Cache for Redis..."
if ! az redis show --name $REDIS_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Redis Cache: $REDIS_NAME"
    az redis create \
        --resource-group $RESOURCE_GROUP \
        --name $REDIS_NAME \
        --location "$LOCATION" \
        --sku Basic \
        --vm-size c1
    print_success "Redis Cache criado"
else
    print_success "Redis Cache já existe"
fi

# Obter Redis connection string
REDIS_HOST=$(az redis show --name $REDIS_NAME --resource-group $RESOURCE_GROUP --query hostName --output tsv)
REDIS_KEY=$(az redis list-keys --name $REDIS_NAME --resource-group $RESOURCE_GROUP --query primaryKey --output tsv)
REDIS_URL="rediss://:$REDIS_KEY@$REDIS_HOST:6380"

# Armazenar segredos no Key Vault
print_step "Armazenando segredos no Key Vault..."
az keyvault secret set --vault-name $KEYVAULT_NAME --name "database-url" --value "$DATABASE_URL" > /dev/null
az keyvault secret set --vault-name $KEYVAULT_NAME --name "redis-url" --value "$REDIS_URL" > /dev/null
az keyvault secret set --vault-name $KEYVAULT_NAME --name "db-password" --value "$DB_PASSWORD" > /dev/null

# Gerar NEXTAUTH_SECRET se não fornecido
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
fi
az keyvault secret set --vault-name $KEYVAULT_NAME --name "nextauth-secret" --value "$NEXTAUTH_SECRET" > /dev/null

print_success "Segredos armazenados no Key Vault"

# Criar Container Apps Environment
print_step "Configurando Container Apps Environment..."
if ! az containerapp env show --name $CONTAINER_ENV --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Container Apps Environment: $CONTAINER_ENV"
    az containerapp env create \
        --resource-group $RESOURCE_GROUP \
        --name $CONTAINER_ENV \
        --location "$LOCATION"
    print_success "Container Apps Environment criado"
else
    print_success "Container Apps Environment já existe"
fi

# Deploy da aplicação
print_step "Fazendo deploy da aplicação..."

# Verificar se as variáveis Azure AD foram fornecidas
if [ -z "$AZURE_AD_CLIENT_ID" ] || [ -z "$AZURE_AD_TENANT_ID" ]; then
    print_error "AZURE_AD_CLIENT_ID e AZURE_AD_TENANT_ID são obrigatórios!"
    print_warning "Configure-os como variáveis de ambiente antes de executar o script:"
    print_warning "export AZURE_AD_CLIENT_ID='seu-client-id'"
    print_warning "export AZURE_AD_TENANT_ID='seu-tenant-id'"
    exit 1
fi

if ! az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    print_step "Criando Container App: $APP_NAME"
    az containerapp create \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --environment $CONTAINER_ENV \
        --image $REGISTRY_SERVER/printcloud:latest \
        --registry-server $REGISTRY_SERVER \
        --registry-username $REGISTRY_USERNAME \
        --registry-password $REGISTRY_PASSWORD \
        --target-port 3000 \
        --ingress external \
        --min-replicas 1 \
        --max-replicas 5 \
        --cpu 1 \
        --memory 2Gi \
        --env-vars \
            NODE_ENV=production \
            NEXT_PUBLIC_AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID \
            NEXT_PUBLIC_AZURE_AD_TENANT_ID=$AZURE_AD_TENANT_ID \
        --secrets \
            database-url="$DATABASE_URL" \
            redis-url="$REDIS_URL" \
            nextauth-secret="$NEXTAUTH_SECRET"
    print_success "Container App criado"
else
    print_step "Atualizando Container App existente..."
    az containerapp update \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --image $REGISTRY_SERVER/printcloud:latest \
        --set-env-vars \
            NODE_ENV=production \
            NEXT_PUBLIC_AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID \
            NEXT_PUBLIC_AZURE_AD_TENANT_ID=$AZURE_AD_TENANT_ID
    print_success "Container App atualizado"
fi

# Obter URL da aplicação
WEBAPP_URL=$(az containerapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query properties.configuration.ingress.fqdn --output tsv)

print_success "Deploy concluído!"

# Executar migrations
print_step "Executando database migrations..."
sleep 30 # Aguardar app inicializar

# Tentar executar migrations
if az containerapp exec \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --command "npx prisma migrate deploy" > /dev/null 2>&1; then
    print_success "Migrations executadas com sucesso"
else
    print_warning "Não foi possível executar migrations automaticamente"
    print_warning "Execute manualmente após o deploy:"
    print_warning "az containerapp exec --resource-group $RESOURCE_GROUP --name $APP_NAME --command 'npx prisma migrate deploy'"
fi

# Informações finais
echo
print_success "🎉 Deploy concluído com sucesso!"
echo
echo -e "${BLUE}📋 Informações do Deploy:${NC}"
echo "🌐 URL da Aplicação: https://$WEBAPP_URL"
echo "🗄️  Database Server: $DB_SERVER"
echo "🔴 Redis Server: $REDIS_HOST"
echo "🔐 Key Vault: $KEYVAULT_NAME"
echo "📦 Registry: $REGISTRY_SERVER"
echo
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo "1. Configurar domínio personalizado (opcional)"
echo "2. Configurar Application Insights para monitoramento"
echo "3. Configurar backup e disaster recovery"
echo "4. Revisar e configurar scaling rules"
echo
echo -e "${YELLOW}🔑 Azure AD Configuration:${NC}"
echo "No Azure Portal, configure o Redirect URI:"
echo "https://$WEBAPP_URL"
echo
echo -e "${GREEN}✅ Deploy finalizado!${NC}"