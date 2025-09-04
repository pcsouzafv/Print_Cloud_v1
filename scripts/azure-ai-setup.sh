#!/bin/bash

# Azure AI Setup Script for Print Cloud v1
# Provisiona recursos Azure AI para agentes em tempo real

set -e

echo "🚀 Iniciando configuração Azure AI para Print Cloud..."

# Variáveis de configuração
SUBSCRIPTION_ID=${AZURE_SUBSCRIPTION_ID:-""}
RESOURCE_GROUP=${AZURE_RESOURCE_GROUP:-"rg-printcloud-prod"}
LOCATION=${AZURE_LOCATION:-"East US 2"}
AI_SERVICE_NAME="printcloud-ai-service"
OPENAI_SERVICE_NAME="printcloud-openai"
COGNITIVE_SEARCH_NAME="printcloud-search"
STORAGE_ACCOUNT_NAME="printcloud$(date +%s | tail -c 8)"

echo "📋 Configurações:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  AI Service: $AI_SERVICE_NAME"
echo ""

# 1. Criar Azure AI Services (Multi-Service)
echo "🧠 Criando Azure AI Services..."
az cognitiveservices account create \
  --name $AI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --kind "CognitiveServices" \
  --sku "S0" \
  --custom-domain $AI_SERVICE_NAME \
  --assign-identity \
  --tags "project=printcloud" "environment=production"

# 2. Criar Azure OpenAI Service
echo "🤖 Criando Azure OpenAI Service..."
az cognitiveservices account create \
  --name $OPENAI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --kind "OpenAI" \
  --sku "S0" \
  --custom-domain $OPENAI_SERVICE_NAME \
  --assign-identity \
  --tags "project=printcloud" "environment=production"

# 3. Deploy modelo GPT-4 Turbo
echo "📦 Fazendo deploy do modelo GPT-4 Turbo..."
az cognitiveservices account deployment create \
  --name $OPENAI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --deployment-name "gpt-4-turbo" \
  --model-name "gpt-4" \
  --model-version "turbo-2024-04-09" \
  --model-format "OpenAI" \
  --sku-capacity 10 \
  --sku-name "Standard"

# 4. Deploy modelo GPT-3.5 Turbo para funções auxiliares
echo "📦 Fazendo deploy do modelo GPT-3.5 Turbo..."
az cognitiveservices account deployment create \
  --name $OPENAI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --deployment-name "gpt-35-turbo" \
  --model-name "gpt-35-turbo" \
  --model-version "0125" \
  --model-format "OpenAI" \
  --sku-capacity 20 \
  --sku-name "Standard"

# 5. Deploy modelo Text Embedding
echo "📦 Fazendo deploy do modelo de Embedding..."
az cognitiveservices account deployment create \
  --name $OPENAI_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --deployment-name "text-embedding-ada-002" \
  --model-name "text-embedding-ada-002" \
  --model-version "2" \
  --model-format "OpenAI" \
  --sku-capacity 30 \
  --sku-name "Standard"

# 6. Criar Azure Cognitive Search
echo "🔍 Criando Azure Cognitive Search..."
az search service create \
  --name $COGNITIVE_SEARCH_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku "Standard" \
  --replica-count 1 \
  --partition-count 1 \
  --tags "project=printcloud" "environment=production"

# 7. Criar Storage Account para dados de treinamento
echo "💾 Criando Storage Account..."
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku "Standard_LRS" \
  --kind "StorageV2" \
  --access-tier "Hot" \
  --tags "project=printcloud" "environment=production"

# 8. Criar container para dados de treinamento
echo "📁 Criando containers de armazenamento..."
STORAGE_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP --account-name $STORAGE_ACCOUNT_NAME --query '[0].value' -o tsv)

az storage container create \
  --name "training-data" \
  --account-name $STORAGE_ACCOUNT_NAME \
  --account-key $STORAGE_KEY \
  --public-access "off"

az storage container create \
  --name "embeddings" \
  --account-name $STORAGE_ACCOUNT_NAME \
  --account-key $STORAGE_KEY \
  --public-access "off"

# 9. Obter chaves e endpoints
echo "🔑 Obtendo informações de acesso..."

AI_ENDPOINT=$(az cognitiveservices account show --name $AI_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "properties.endpoint" -o tsv)
AI_KEY=$(az cognitiveservices account keys list --name $AI_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "key1" -o tsv)

OPENAI_ENDPOINT=$(az cognitiveservices account show --name $OPENAI_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "properties.endpoint" -o tsv)
OPENAI_KEY=$(az cognitiveservices account keys list --name $OPENAI_SERVICE_NAME --resource-group $RESOURCE_GROUP --query "key1" -o tsv)

SEARCH_ENDPOINT="https://$COGNITIVE_SEARCH_NAME.search.windows.net"
SEARCH_KEY=$(az search admin-key show --resource-group $RESOURCE_GROUP --service-name $COGNITIVE_SEARCH_NAME --query "primaryKey" -o tsv)

STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP --query "connectionString" -o tsv)

# 10. Criar arquivo .env.azure.ai
echo "📝 Criando arquivo de configuração..."
cat > .env.azure.ai << EOF
# Azure AI Configuration for Print Cloud v1
# Generated on $(date)

# Azure AI Services
AZURE_AI_ENDPOINT=$AI_ENDPOINT
AZURE_AI_KEY=$AI_KEY

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=$OPENAI_ENDPOINT
AZURE_OPENAI_KEY=$OPENAI_KEY
AZURE_OPENAI_GPT4_DEPLOYMENT=gpt-4-turbo
AZURE_OPENAI_GPT35_DEPLOYMENT=gpt-35-turbo
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002

# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=$SEARCH_ENDPOINT
AZURE_SEARCH_KEY=$SEARCH_KEY

# Storage Account
AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION_STRING
AZURE_STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT_NAME

# Configuration
AZURE_AI_REGION=$LOCATION
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP
EOF

echo "✅ Configuração Azure AI concluída!"
echo ""
echo "📋 Recursos criados:"
echo "  - Azure AI Services: $AI_SERVICE_NAME"
echo "  - Azure OpenAI: $OPENAI_SERVICE_NAME"
echo "  - Cognitive Search: $COGNITIVE_SEARCH_NAME"
echo "  - Storage Account: $STORAGE_ACCOUNT_NAME"
echo ""
echo "🔧 Modelos deployados:"
echo "  - GPT-4 Turbo (gpt-4-turbo)"
echo "  - GPT-3.5 Turbo (gpt-35-turbo)"
echo "  - Text Embedding Ada 002"
echo ""
echo "📁 Arquivo criado: .env.azure.ai"
echo ""
echo "🚀 Próximos passos:"
echo "  1. Copie o conteúdo de .env.azure.ai para seu .env principal"
echo "  2. Execute o script de treinamento do modelo"
echo "  3. Configure os agentes de IA em tempo real"