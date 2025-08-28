@echo off
REM Deploy script para Azure - Print Cloud (Windows)
REM Execute este script para fazer deploy completo na Azure

setlocal EnableDelayedExpansion

REM Configurações padrão (podem ser alteradas via variáveis de ambiente)
if "%RESOURCE_GROUP%"=="" set RESOURCE_GROUP=rg-printcloud-prod
if "%LOCATION%"=="" set LOCATION=Brazil South
if "%APP_NAME%"=="" set APP_NAME=printcloud-app-prod
if "%DB_NAME%"=="" set DB_NAME=printcloud-db-prod
if "%REDIS_NAME%"=="" set REDIS_NAME=printcloud-cache-prod
if "%REGISTRY_NAME%"=="" set REGISTRY_NAME=printcloudregistry
if "%KEYVAULT_NAME%"=="" set KEYVAULT_NAME=printcloud-keyvault-prod
if "%CONTAINER_ENV%"=="" set CONTAINER_ENV=printcloud-env-prod

echo 🚀 Iniciando deploy do Print Cloud na Azure...
echo.

REM Verificar se está logado na Azure CLI
echo 🔍 Verificando login Azure CLI...
az account show >nul 2>&1
if errorlevel 1 (
    echo ❌ Não está logado na Azure CLI. Execute 'az login' primeiro.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('az account show --query id --output tsv') do set SUBSCRIPTION_ID=%%i
echo ✅ Logado na subscription: %SUBSCRIPTION_ID%
echo.

REM Verificar se o resource group existe
echo 🔍 Verificando/criando Resource Group...
az group show --name %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Resource Group: %RESOURCE_GROUP%
    az group create --name %RESOURCE_GROUP% --location "%LOCATION%"
    if errorlevel 1 (
        echo ❌ Erro ao criar Resource Group
        pause
        exit /b 1
    )
    echo ✅ Resource Group criado
) else (
    echo ✅ Resource Group já existe
)
echo.

REM Criar Container Registry
echo 🐳 Configurando Azure Container Registry...
az acr show --name %REGISTRY_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Container Registry: %REGISTRY_NAME%
    az acr create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %REGISTRY_NAME% ^
        --sku Basic ^
        --admin-enabled true
    if errorlevel 1 (
        echo ❌ Erro ao criar Container Registry
        pause
        exit /b 1
    )
    echo ✅ Container Registry criado
) else (
    echo ✅ Container Registry já existe
)

REM Obter credenciais do registry
for /f "tokens=*" %%i in ('az acr show --name %REGISTRY_NAME% --resource-group %RESOURCE_GROUP% --query loginServer --output tsv') do set REGISTRY_SERVER=%%i
for /f "tokens=*" %%i in ('az acr credential show --name %REGISTRY_NAME% --query username --output tsv') do set REGISTRY_USERNAME=%%i
for /f "tokens=*" %%i in ('az acr credential show --name %REGISTRY_NAME% --query passwords[0].value --output tsv') do set REGISTRY_PASSWORD=%%i

echo ✅ Registry: %REGISTRY_SERVER%
echo.

REM Build e push da imagem
echo 🔨 Build e push da imagem Docker...
docker build -t printcloud:latest .
if errorlevel 1 (
    echo ❌ Erro no build da imagem
    pause
    exit /b 1
)

docker tag printcloud:latest %REGISTRY_SERVER%/printcloud:latest

echo 🔑 Fazendo login no registry...
echo %REGISTRY_PASSWORD% | docker login %REGISTRY_SERVER% --username %REGISTRY_USERNAME% --password-stdin
if errorlevel 1 (
    echo ❌ Erro no login do registry
    pause
    exit /b 1
)

echo 📤 Fazendo push da imagem...
docker push %REGISTRY_SERVER%/printcloud:latest
if errorlevel 1 (
    echo ❌ Erro no push da imagem
    pause
    exit /b 1
)
echo ✅ Imagem enviada para o registry
echo.

REM Verificar variáveis Azure AD
if "%AZURE_AD_CLIENT_ID%"=="" (
    echo ❌ AZURE_AD_CLIENT_ID é obrigatório!
    echo ⚠️  Configure-o como variável de ambiente antes de executar o script:
    echo set AZURE_AD_CLIENT_ID=seu-client-id
    echo set AZURE_AD_TENANT_ID=seu-tenant-id
    pause
    exit /b 1
)

if "%AZURE_AD_TENANT_ID%"=="" (
    echo ❌ AZURE_AD_TENANT_ID é obrigatório!
    echo ⚠️  Configure-o como variável de ambiente antes de executar o script:
    echo set AZURE_AD_CLIENT_ID=seu-client-id
    echo set AZURE_AD_TENANT_ID=seu-tenant-id
    pause
    exit /b 1
)

REM Criar Key Vault
echo 🔐 Configurando Azure Key Vault...
az keyvault show --name %KEYVAULT_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Key Vault: %KEYVAULT_NAME%
    az keyvault create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %KEYVAULT_NAME% ^
        --location "%LOCATION%"
    if errorlevel 1 (
        echo ❌ Erro ao criar Key Vault
        pause
        exit /b 1
    )
    echo ✅ Key Vault criado
) else (
    echo ✅ Key Vault já existe
)
echo.

REM Gerar senhas se não fornecidas
if "%DB_PASSWORD%"=="" (
    REM Gerar senha aleatória simples
    set DB_PASSWORD=PrintCloud2024!%RANDOM%
    echo ⚠️  Senha do DB gerada automaticamente
)

if "%NEXTAUTH_SECRET%"=="" (
    set NEXTAUTH_SECRET=super-secret-key-for-nextauth-%RANDOM%-%RANDOM%
)

REM Criar PostgreSQL Database
echo 🗄️  Configurando Azure Database for PostgreSQL...
az postgres flexible-server show --name %DB_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando PostgreSQL Server: %DB_NAME% (isso pode demorar alguns minutos...)
    az postgres flexible-server create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %DB_NAME% ^
        --location "%LOCATION%" ^
        --admin-user printcloudadmin ^
        --admin-password "%DB_PASSWORD%" ^
        --sku-name Standard_B2s ^
        --tier Burstable ^
        --storage-size 32 ^
        --version 14 ^
        --yes
    
    if errorlevel 1 (
        echo ❌ Erro ao criar PostgreSQL
        pause
        exit /b 1
    )
    
    REM Criar database
    az postgres flexible-server db create ^
        --resource-group %RESOURCE_GROUP% ^
        --server-name %DB_NAME% ^
        --database-name printcloud
    
    echo ✅ PostgreSQL criado
) else (
    echo ✅ PostgreSQL já existe
)

REM Obter connection string
for /f "tokens=*" %%i in ('az postgres flexible-server show --name %DB_NAME% --resource-group %RESOURCE_GROUP% --query fullyQualifiedDomainName --output tsv') do set DB_SERVER=%%i
set DATABASE_URL=postgresql://printcloudadmin:%DB_PASSWORD%@%DB_SERVER%/printcloud?sslmode=require
echo.

REM Criar Redis Cache
echo ⚡ Configurando Azure Cache for Redis...
az redis show --name %REDIS_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Redis Cache: %REDIS_NAME%
    az redis create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %REDIS_NAME% ^
        --location "%LOCATION%" ^
        --sku Basic ^
        --vm-size c1
    if errorlevel 1 (
        echo ❌ Erro ao criar Redis Cache
        pause
        exit /b 1
    )
    echo ✅ Redis Cache criado
) else (
    echo ✅ Redis Cache já existe
)

REM Obter Redis connection string
for /f "tokens=*" %%i in ('az redis show --name %REDIS_NAME% --resource-group %RESOURCE_GROUP% --query hostName --output tsv') do set REDIS_HOST=%%i
for /f "tokens=*" %%i in ('az redis list-keys --name %REDIS_NAME% --resource-group %RESOURCE_GROUP% --query primaryKey --output tsv') do set REDIS_KEY=%%i
set REDIS_URL=rediss://:%REDIS_KEY%@%REDIS_HOST%:6380
echo.

REM Armazenar segredos no Key Vault
echo 💾 Armazenando segredos no Key Vault...
az keyvault secret set --vault-name %KEYVAULT_NAME% --name "database-url" --value "%DATABASE_URL%" >nul
az keyvault secret set --vault-name %KEYVAULT_NAME% --name "redis-url" --value "%REDIS_URL%" >nul
az keyvault secret set --vault-name %KEYVAULT_NAME% --name "db-password" --value "%DB_PASSWORD%" >nul
az keyvault secret set --vault-name %KEYVAULT_NAME% --name "nextauth-secret" --value "%NEXTAUTH_SECRET%" >nul
echo ✅ Segredos armazenados no Key Vault
echo.

REM Criar Container Apps Environment
echo 🚀 Configurando Container Apps Environment...
az containerapp env show --name %CONTAINER_ENV% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Container Apps Environment: %CONTAINER_ENV%
    az containerapp env create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %CONTAINER_ENV% ^
        --location "%LOCATION%"
    if errorlevel 1 (
        echo ❌ Erro ao criar Container Apps Environment
        pause
        exit /b 1
    )
    echo ✅ Container Apps Environment criado
) else (
    echo ✅ Container Apps Environment já existe
)
echo.

REM Deploy da aplicação
echo 🚀 Fazendo deploy da aplicação...
az containerapp show --name %APP_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if errorlevel 1 (
    echo 📦 Criando Container App: %APP_NAME%
    az containerapp create ^
        --resource-group %RESOURCE_GROUP% ^
        --name %APP_NAME% ^
        --environment %CONTAINER_ENV% ^
        --image %REGISTRY_SERVER%/printcloud:latest ^
        --registry-server %REGISTRY_SERVER% ^
        --registry-username %REGISTRY_USERNAME% ^
        --registry-password "%REGISTRY_PASSWORD%" ^
        --target-port 3000 ^
        --ingress external ^
        --min-replicas 1 ^
        --max-replicas 5 ^
        --cpu 1 ^
        --memory 2Gi ^
        --env-vars ^
            NODE_ENV=production ^
            NEXT_PUBLIC_AZURE_AD_CLIENT_ID=%AZURE_AD_CLIENT_ID% ^
            NEXT_PUBLIC_AZURE_AD_TENANT_ID=%AZURE_AD_TENANT_ID% ^
        --secrets ^
            database-url="%DATABASE_URL%" ^
            redis-url="%REDIS_URL%" ^
            nextauth-secret="%NEXTAUTH_SECRET%"
    if errorlevel 1 (
        echo ❌ Erro ao criar Container App
        pause
        exit /b 1
    )
    echo ✅ Container App criado
) else (
    echo 📦 Atualizando Container App existente...
    az containerapp update ^
        --resource-group %RESOURCE_GROUP% ^
        --name %APP_NAME% ^
        --image %REGISTRY_SERVER%/printcloud:latest ^
        --set-env-vars ^
            NODE_ENV=production ^
            NEXT_PUBLIC_AZURE_AD_CLIENT_ID=%AZURE_AD_CLIENT_ID% ^
            NEXT_PUBLIC_AZURE_AD_TENANT_ID=%AZURE_AD_TENANT_ID%
    if errorlevel 1 (
        echo ❌ Erro ao atualizar Container App
        pause
        exit /b 1
    )
    echo ✅ Container App atualizado
)

REM Obter URL da aplicação
for /f "tokens=*" %%i in ('az containerapp show --resource-group %RESOURCE_GROUP% --name %APP_NAME% --query properties.configuration.ingress.fqdn --output tsv') do set WEBAPP_URL=%%i

echo ✅ Deploy concluído!
echo.

REM Executar migrations
echo 🗄️  Executando database migrations...
echo ⏳ Aguardando aplicação inicializar (30 segundos)...
timeout /t 30 >nul

echo 📊 Tentando executar migrations...
az containerapp exec ^
    --resource-group %RESOURCE_GROUP% ^
    --name %APP_NAME% ^
    --command "npx prisma migrate deploy" >nul 2>&1

if errorlevel 1 (
    echo ⚠️  Não foi possível executar migrations automaticamente
    echo ⚠️  Execute manualmente após o deploy:
    echo az containerapp exec --resource-group %RESOURCE_GROUP% --name %APP_NAME% --command "npx prisma migrate deploy"
) else (
    echo ✅ Migrations executadas com sucesso
)

echo.
echo 🎉 Deploy concluído com sucesso!
echo.
echo 📋 Informações do Deploy:
echo 🌐 URL da Aplicação: https://%WEBAPP_URL%
echo 🗄️  Database Server: %DB_SERVER%
echo 🔴 Redis Server: %REDIS_HOST%
echo 🔐 Key Vault: %KEYVAULT_NAME%
echo 📦 Registry: %REGISTRY_SERVER%
echo.
echo ⚠️  Próximos passos:
echo 1. Configurar domínio personalizado (opcional)
echo 2. Configurar Application Insights para monitoramento
echo 3. Configurar backup e disaster recovery
echo 4. Revisar e configurar scaling rules
echo.
echo 🔑 Azure AD Configuration:
echo No Azure Portal, configure o Redirect URI:
echo https://%WEBAPP_URL%
echo.
echo ✅ Deploy finalizado!
pause