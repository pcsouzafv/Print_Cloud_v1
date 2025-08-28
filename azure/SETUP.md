# 🚀 Setup Inicial Azure - Print Cloud

Guia passo a passo para configurar o ambiente Azure antes do deploy.

## 📋 Pré-requisitos

### 1. **Conta Azure**
- Subscription Azure ativa
- Permissões de Contributor ou superior
- Azure CLI instalado (`az --version`)

### 2. **Ferramentas Locais**
```bash
# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Git
sudo apt-get install git

# Node.js (opcional para testes locais)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. **Configuração Azure AD**
É **obrigatório** ter uma aplicação registrada no Azure AD antes do deploy.

## 🔑 Configurar Azure Active Directory

### 1. **Registrar Aplicação**

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Vá para **Azure Active Directory** > **App registrations**
3. Clique em **New registration**
4. Configure:
   - **Name**: `Print Cloud Production`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Deixe em branco por enquanto

### 2. **Configurar Permissões**

1. Na aplicação criada, vá para **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Escolha **Delegated permissions** e adicione:
   - `User.Read` (para informações básicas do usuário)
   - `Group.Read.All` (para verificar grupos do usuário)
   - `Directory.Read.All` (para informações do diretório)

5. Clique em **Grant admin consent** para aprovar as permissões

### 3. **Obter Credenciais**

Na página **Overview** da aplicação, anote:
- **Application (client) ID** 
- **Directory (tenant) ID**

### 4. **Configurar Redirect URIs (após deploy)**
Após o deploy, você precisará voltar aqui para configurar:
- **Web Redirect URI**: `https://sua-app-url.azurecontainerapps.io`

## 🔧 Preparar Ambiente Azure

### 1. **Login e Configuração**

```bash
# Login na Azure
az login

# Listar subscriptions disponíveis
az account list --output table

# Selecionar subscription (substitua pelo ID correto)
az account set --subscription "sua-subscription-id"

# Verificar subscription ativa
az account show
```

### 2. **Registrar Providers**

```bash
# Registrar providers necessários
az provider register --namespace Microsoft.ContainerService
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.DBforPostgreSQL
az provider register --namespace Microsoft.Cache
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.KeyVault

# Verificar status
az provider show --namespace Microsoft.App --query "registrationState"
```

### 3. **Verificar Quotas**

```bash
# Verificar quotas de Container Apps
az vm list-usage --location "Brazil South" --query "[?contains(name.value, 'cores')]"

# Verificar quotas de PostgreSQL
az postgres flexible-server list-skus --location "Brazil South"
```

## 🚀 Deploy Automatizado

### Opção 1: Script Bash (Linux/MacOS/WSL)

```bash
# Configurar variáveis obrigatórias
export AZURE_AD_CLIENT_ID="seu-client-id-aqui"
export AZURE_AD_TENANT_ID="seu-tenant-id-aqui"

# Opcionais (usar padrões se não definido)
export RESOURCE_GROUP="rg-printcloud-prod"
export LOCATION="Brazil South"
export DB_PASSWORD="SuaSenhaSegura123!"

# Executar deploy
chmod +x azure/scripts/deploy.sh
./azure/scripts/deploy.sh
```

### Opção 2: Script Windows

```cmd
# Configurar variáveis obrigatórias
set AZURE_AD_CLIENT_ID=seu-client-id-aqui
set AZURE_AD_TENANT_ID=seu-tenant-id-aqui

# Opcionais
set RESOURCE_GROUP=rg-printcloud-prod
set LOCATION=Brazil South
set DB_PASSWORD=SuaSenhaSegura123!

# Executar deploy
azure\scripts\deploy.bat
```

### Opção 3: Deploy Manual

Se preferir fazer passo a passo, siga o [guia completo no AZURE.md](AZURE.md).

## 🔒 Configurar GitHub Actions (CI/CD)

### 1. **Criar Service Principal**

```bash
# Criar service principal para GitHub Actions
az ad sp create-for-rbac \
  --name "printcloud-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id --output tsv) \
  --sdk-auth

# Copie o JSON completo retornado
```

### 2. **Configurar Secrets no GitHub**

No repositório GitHub, vá em **Settings** > **Secrets and variables** > **Actions** e adicione:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | JSON completo do service principal |
| `AZURE_AD_CLIENT_ID` | Client ID do Azure AD |
| `AZURE_AD_TENANT_ID` | Tenant ID do Azure AD |

### 3. **Verificar Workflow**

O arquivo `.github/workflows/azure-deploy.yml` já está configurado e será executado automaticamente nos pushes para `main`.

## ✅ Verificação Pós-Deploy

### 1. **Acessar Aplicação**

```bash
# Obter URL da aplicação
az containerapp show \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### 2. **Verificar Health Check**

```bash
# Testar endpoint de saúde
curl https://sua-app-url.azurecontainerapps.io/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-24T10:00:00.000Z",
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

### 3. **Executar Migrations (se necessário)**

```bash
# Executar migrations manualmente se falharam no deploy
az containerapp exec \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --command "npx prisma migrate deploy"
```

### 4. **Popular Dados de Teste**

```bash
# Executar seed para dados de teste
az containerapp exec \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --command "npm run db:seed"
```

## 🔧 Configurações Finais

### 1. **Domínio Personalizado (Opcional)**

```bash
# Adicionar domínio personalizado
az containerapp hostname add \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --hostname printcloud.suaempresa.com
```

### 2. **Configurar Redirect URI no Azure AD**

1. Volte ao Azure Portal > Azure AD > App registrations
2. Selecione sua aplicação
3. Vá em **Authentication**
4. Adicione a **Web Redirect URI**:
   - `https://sua-app-url.azurecontainerapps.io`

### 3. **Configurar Application Insights (Recomendado)**

```bash
# Criar Application Insights
az monitor app-insights component create \
  --resource-group rg-printcloud-prod \
  --app printcloud-insights-prod \
  --location "Brazil South" \
  --kind web

# Obter connection string
az monitor app-insights component show \
  --resource-group rg-printcloud-prod \
  --app printcloud-insights-prod \
  --query connectionString \
  --output tsv
```

## 🆘 Troubleshooting

### Problema: Deploy falha com erro de quota
```bash
# Verificar quotas disponíveis
az vm list-usage --location "Brazil South" --query "[?contains(name.value, 'cores')]"

# Solicitar aumento de quota no portal Azure
```

### Problema: Aplicação não responde
```bash
# Verificar logs da aplicação
az containerapp logs show \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --follow

# Verificar status da aplicação
az containerapp show \
  --resource-group rg-printcloud-prod \
  --name printcloud-app-prod \
  --query properties.provisioningState
```

### Problema: Banco de dados não conecta
```bash
# Verificar firewall do PostgreSQL
az postgres flexible-server firewall-rule create \
  --resource-group rg-printcloud-prod \
  --name printcloud-db-prod \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Testar conexão
az postgres flexible-server execute \
  --name printcloud-db-prod \
  --admin-user printcloudadmin \
  --admin-password "sua-senha" \
  --database-name printcloud \
  --querytext "SELECT 1;"
```

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs da aplicação
2. Consulte a documentação do Azure Container Apps
3. Abra uma issue no repositório GitHub

---

**Setup Guide** 🔧  
Configuração completa do ambiente Azure para Print Cloud!