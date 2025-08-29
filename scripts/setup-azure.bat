@echo off
REM Print Cloud - Azure Infrastructure Setup (Windows)
REM Este script cria toda a infraestrutura necessária na Azure

echo 🚀 Iniciando setup da infraestrutura Azure para Print Cloud
echo ==================================================

REM Configurações
set RESOURCE_GROUP=rg-printcloud-prod
set LOCATION=East US
set CONTAINER_REGISTRY=printcloudregistry%RANDOM%
set CONTAINER_APP_ENV=printcloud-env
set CONTAINER_APP=printcloud-app-prod
set DATABASE_SERVER=printcloud-db-%RANDOM%
set DATABASE_NAME=printclouddb
set STORAGE_ACCOUNT=printcloudstorage%RANDOM%

REM Verificar se está logado
echo ✅ Verificando login Azure...
az account show >nul 2>&1
if errorlevel 1 (
    echo ❌ Não está logado no Azure. Execute: az login
    pause
    exit /b 1
)

REM 1. Criar Resource Group
echo 📦 Criando Resource Group: %RESOURCE_GROUP%
az group create --name %RESOURCE_GROUP% --location "%LOCATION%"

REM 2. Criar Container Registry
echo 🐳 Criando Azure Container Registry: %CONTAINER_REGISTRY%
az acr create --name %CONTAINER_REGISTRY% --resource-group %RESOURCE_GROUP% --location "%LOCATION%" --sku Basic --admin-enabled true

REM 3. Criar Container Apps Environment
echo 🌐 Criando Container Apps Environment: %CONTAINER_APP_ENV%
az containerapp env create --name %CONTAINER_APP_ENV% --resource-group %RESOURCE_GROUP% --location "%LOCATION%"

REM 4. Criar PostgreSQL Database
echo 🗄️ Criando PostgreSQL Database: %DATABASE_SERVER%
az postgres flexible-server create --name %DATABASE_SERVER% --resource-group %RESOURCE_GROUP% --location "%LOCATION%" --admin-user printcloudadmin --admin-password "PrintCloud123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --public-access 0.0.0.0 --yes

REM 5. Criar database dentro do servidor
echo 📊 Criando database: %DATABASE_NAME%
az postgres flexible-server db create --resource-group %RESOURCE_GROUP% --server-name %DATABASE_SERVER% --database-name %DATABASE_NAME%

REM 6. Criar Storage Account
echo 💾 Criando Storage Account: %STORAGE_ACCOUNT%
az storage account create --name %STORAGE_ACCOUNT% --resource-group %RESOURCE_GROUP% --location "%LOCATION%" --sku Standard_LRS --kind StorageV2

REM 7. Criar Container App
echo 🚀 Criando Container App: %CONTAINER_APP%
az containerapp create --name %CONTAINER_APP% --resource-group %RESOURCE_GROUP% --environment %CONTAINER_APP_ENV% --image nginx:latest --target-port 3000 --ingress external --min-replicas 1 --max-replicas 3 --cpu 1.0 --memory 2Gi

echo.
echo ✅ Setup concluído com sucesso!
echo ==================================================
echo Agora execute os comandos de informações para obter as credenciais
echo ==================================================

REM Salvar informações em arquivo
echo AZURE_RESOURCE_GROUP=%RESOURCE_GROUP% > .env.azure.generated
echo AZURE_CONTAINER_REGISTRY=%CONTAINER_REGISTRY% >> .env.azure.generated
echo AZURE_CONTAINER_APP=%CONTAINER_APP% >> .env.azure.generated
echo AZURE_CONTAINER_APP_ENV=%CONTAINER_APP_ENV% >> .env.azure.generated
echo DATABASE_SERVER=%DATABASE_SERVER% >> .env.azure.generated
echo STORAGE_ACCOUNT=%STORAGE_ACCOUNT% >> .env.azure.generated

echo 📋 Informações salvas em .env.azure.generated
pause