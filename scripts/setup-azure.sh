#!/bin/bash

# Print Cloud - Azure Infrastructure Setup
# Este script cria toda a infraestrutura necessária na Azure

set -e

# Configurações
RESOURCE_GROUP="rg-printcloud-prod"
LOCATION="East US"
CONTAINER_REGISTRY="printcloudregistry$(date +%s)"
CONTAINER_APP_ENV="printcloud-env"
CONTAINER_APP="printcloud-app-prod"
DATABASE_SERVER="printcloud-db-$(date +%s)"
DATABASE_NAME="printclouddb"
STORAGE_ACCOUNT="printcloudstorage$(date +%s)"

echo "🚀 Iniciando setup da infraestrutura Azure para Print Cloud"
echo "=================================================="

# 1. Criar Resource Group
echo "📦 Criando Resource Group: $RESOURCE_GROUP"
az group create \
  --name $RESOURCE_GROUP \
  --location "$LOCATION"

# 2. Criar Container Registry
echo "🐳 Criando Azure Container Registry: $CONTAINER_REGISTRY"
az acr create \
  --name $CONTAINER_REGISTRY \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Basic \
  --admin-enabled true

# 3. Criar Container Apps Environment
echo "🌐 Criando Container Apps Environment: $CONTAINER_APP_ENV"
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION"

# 4. Criar PostgreSQL Database
echo "🗄️  Criando PostgreSQL Database: $DATABASE_SERVER"
az postgres flexible-server create \
  --name $DATABASE_SERVER \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --admin-user printcloudadmin \
  --admin-password "PrintCloud123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --public-access 0.0.0.0 \
  --yes

# 5. Criar database dentro do servidor
echo "📊 Criando database: $DATABASE_NAME"
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DATABASE_SERVER \
  --database-name $DATABASE_NAME

# 6. Criar Storage Account para arquivos
echo "💾 Criando Storage Account: $STORAGE_ACCOUNT"
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2

# 7. Obter connection strings
echo "🔗 Obtendo connection strings..."

ACR_SERVER=$(az acr show --name $CONTAINER_REGISTRY --resource-group $RESOURCE_GROUP --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $CONTAINER_REGISTRY --resource-group $RESOURCE_GROUP --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $CONTAINER_REGISTRY --resource-group $RESOURCE_REGISTRY --query passwords[0].value --output tsv)

DATABASE_HOST=$(az postgres flexible-server show --name $DATABASE_SERVER --resource-group $RESOURCE_GROUP --query fullyQualifiedDomainName --output tsv)
DATABASE_URL="postgresql://printcloudadmin:PrintCloud123!@$DATABASE_HOST:5432/$DATABASE_NAME?sslmode=require"

STORAGE_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP --account-name $STORAGE_ACCOUNT --query [0].value --output tsv)
STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=$STORAGE_ACCOUNT;AccountKey=$STORAGE_KEY;EndpointSuffix=core.windows.net"

# 8. Criar Container App com variáveis de ambiente
echo "🚀 Criando Container App: $CONTAINER_APP"
az containerapp create \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image nginx:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 1.0 \
  --memory 2Gi \
  --env-vars \
    DATABASE_URL="$DATABASE_URL" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
    NODE_ENV="production" \
    NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
    NEXTAUTH_URL="https://$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)"

echo ""
echo "✅ Setup concluído com sucesso!"
echo "=================================================="
echo "📋 INFORMAÇÕES DA INFRAESTRUTURA:"
echo "=================================================="
echo "🏢 Resource Group: $RESOURCE_GROUP"
echo "🐳 Container Registry: $ACR_SERVER"
echo "🌐 Container App: $CONTAINER_APP"
echo "🗄️  Database Server: $DATABASE_HOST"
echo "💾 Storage Account: $STORAGE_ACCOUNT"
echo ""
echo "🔐 CREDENCIAIS PARA GITHUB SECRETS:"
echo "=================================================="
echo "Container Registry:"
echo "  REGISTRY_LOGIN_SERVER: $ACR_SERVER"
echo "  REGISTRY_USERNAME: $ACR_USERNAME"
echo "  REGISTRY_PASSWORD: $ACR_PASSWORD"
echo ""
echo "Database:"
echo "  DATABASE_URL: $DATABASE_URL"
echo ""
echo "Storage:"
echo "  AZURE_STORAGE_CONNECTION_STRING: $STORAGE_CONNECTION_STRING"
echo ""
echo "🌐 URL da aplicação estará disponível em:"
echo "https://$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)"
echo ""
echo "🔧 Para criar o Service Principal para GitHub Actions, execute:"
echo "az ad sp create-for-rbac --name printcloud-deploy --role contributor --scopes /subscriptions/\$(az account show --query id --output tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"