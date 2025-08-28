# 🚀 Guia Completo de Migração - Print Cloud

## 📋 Visão Geral

Este guia detalha como migrar completamente o projeto Print Cloud para uma nova conta Microsoft/Azure, incluindo todos os recursos, configurações e scripts automatizados necessários.

O processo de migração é totalmente automatizado através de scripts PowerShell que criam uma nova instância completamente independente da aplicação Print Cloud em qualquer conta Azure.

## 🏗️ Arquitetura da Aplicação

### Tecnologias Utilizadas
- **Frontend**: Next.js 14 com TypeScript
- **Autenticação**: Microsoft Authentication Library (MSAL) + Azure AD
- **Base de Dados**: PostgreSQL (Azure Database for PostgreSQL)
- **Hospedagem**: Azure Container Apps
- **Registro de Containers**: Azure Container Registry (ACR)
- **ORM**: Prisma
- **Containerização**: Docker
- **IA e Análise**: Azure OpenAI Service + Azure Text Analytics

### Recursos Azure Criados
- **Resource Group**: `rg-printcloud-prod`
- **Container Apps Environment**: `printcloud-env-prod`
- **Container App**: `printcloud-app-prod`
- **Container Registry**: `printcloudregistry`
- **PostgreSQL Database**: `printcloud-db-prod`
- **Azure AD App Registration**: `Print Cloud Production`
- **Azure OpenAI Service**: Serviços de IA conversacional
- **Azure Text Analytics**: Análise de sentimento e padrões

### Configurações da Instância Atual
- **Location**: Brazil South
- **Subscription**: Assinatura do Azure 1
- **Tenant**: vtr1m.onmicrosoft.com
- **Client ID**: f37521b3-eff4-4c2e-94ac-470c858cde33
- **Tenant ID**: eac6c00d-e01e-40f8-bb5f-bac6b0ced795

## 📂 Estrutura de Arquivos

```
Print_Cloud_v1/
├── scripts/
│   └── migration/
│       ├── 01_prereqs_check.ps1         # Verificação de pré-requisitos
│       ├── 02_configure_azure_ad.ps1    # Configuração Azure AD
│       ├── 03_deploy_infrastructure.ps1 # Deploy da infraestrutura
│       ├── 04_update_redirect_uris.ps1  # Atualização redirect URIs
│       ├── 05_run_migrations.ps1        # Migrações do banco
│       └── migrate_complete.ps1         # Script completo automático
├── src/
│   ├── app/                             # Aplicação Next.js
│   ├── components/                      # Componentes React
│   ├── lib/                            # Bibliotecas e utilitários
│   ├── providers/                      # Providers (MSAL, etc.)
│   └── types/                          # Definições TypeScript
├── prisma/
│   ├── schema.prisma                   # Schema da base de dados
│   └── seed.ts                         # Dados iniciais
├── Dockerfile                          # Container da aplicação
├── docker-compose.yml                  # Desenvolvimento local
├── package.json                        # Dependências Node.js
├── .env.example                        # Exemplo variáveis ambiente
├── .env.local                          # Configuração desenvolvimento
└── azure_ad_config.json               # Configuração gerada (após migração)
```

## 🔄 Processo de Migração Completo

### Opção 1: Migração Automática (Recomendada)

Execute o script principal que automatiza todo o processo:

```powershell
# Na pasta do projeto
.\scripts\migration\migrate_complete.ps1
```

O script irá executar automaticamente todas as 5 fases da migração.

### Opção 2: Migração Manual (Passo a Passo)

#### Fase 1: Verificação de Pré-requisitos

```powershell
.\scripts\migration\01_prereqs_check.ps1
```

**Verifica:**
- Azure CLI instalado e funcional
- Docker instalado e executando
- Node.js instalado
- Git instalado
- Login no Azure CLI realizado
- Provedores Azure necessários

#### Fase 2: Configuração Azure AD

```powershell
.\scripts\migration\02_configure_azure_ad.ps1
```

**Executa:**
- Cria App Registration no Azure AD
- Configura permissões Microsoft Graph
- Define redirect URIs temporários
- Gera configuração inicial
- Salva credenciais no arquivo `azure_ad_config.json`

#### Fase 3: Deploy da Infraestrutura

```powershell
.\scripts\migration\03_deploy_infrastructure.ps1
```

**Cria:**
- Resource Group
- Container Registry (ACR)
- PostgreSQL Database
- Container Apps Environment
- Build e push da imagem Docker
- Deploy da aplicação Container App
- Configuração de rede e DNS

#### Fase 4: Atualização de Redirect URIs

```powershell
.\scripts\migration\04_update_redirect_uris.ps1
```

**Atualiza:**
- Redirect URIs no Azure AD
- Inclui URL da aplicação produzida
- Mantém URLs de desenvolvimento local

#### Fase 5: Migrações da Base de Dados

```powershell
.\scripts\migration\05_run_migrations.ps1
```

**Executa:**
- Instalação de dependências
- Geração do cliente Prisma
- Sincronização do schema da base de dados
- Execução de seeds (dados iniciais)
- Teste de conectividade

## 🛠️ Pré-requisitos

### Ferramentas Necessárias
- **Azure CLI** v2.50+ - [Instalar](https://aka.ms/InstallAzureCli)
- **Docker Desktop** - [Instalar](https://docs.docker.com/desktop/install/windows-install/)
- **Node.js** v18+ - [Instalar](https://nodejs.org/)
- **Git** - [Instalar](https://git-scm.com/download/win)
- **PowerShell** 5.1+ (incluído no Windows)

### Permissões Azure Necessárias
- **Contributor** na subscription Azure
- **Application Administrator** no Azure AD
- Permissão para criar recursos na subscription

### Configuração Inicial
```powershell
# 1. Login no Azure
az login

# 2. Verificar subscription ativa
az account show

# 3. Configurar subscription (se necessário)
az account set --subscription "SUA_SUBSCRIPTION_ID"
```

## ⚙️ Configurações Personalizadas

### Parâmetros do Script Principal

```powershell
.\scripts\migration\migrate_complete.ps1 `
    -AppName "Meu Print Cloud" `
    -ResourceGroup "rg-meuapp-prod" `
    -Location "East US" `
    -ConfigFile "minha_config.json"
```

### Parâmetros Disponíveis
- **AppName**: Nome da aplicação Azure AD (padrão: "Print Cloud Production")
- **ResourceGroup**: Nome do resource group (padrão: "rg-printcloud-prod")
- **Location**: Localização Azure (padrão: "Brazil South")
- **ConfigFile**: Arquivo de configuração (padrão: "azure_ad_config.json")
- **SkipPrereqs**: Pula verificação de pré-requisitos
- **Verbose**: Output detalhado

### 🤖 Configuração dos Serviços de IA (Opcional)

Para funcionalidade completa de IA, configure as variáveis de ambiente antes do deploy:

```powershell
# Configuração Azure OpenAI
$env:AZURE_OPENAI_ENDPOINT = "https://seu-openai.openai.azure.com/"
$env:AZURE_OPENAI_API_KEY = "sua-api-key"
$env:AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-35-turbo"

# Configuração Text Analytics
$env:AZURE_TEXT_ANALYTICS_ENDPOINT = "https://seu-text-analytics.cognitiveservices.azure.com/"
$env:AZURE_TEXT_ANALYTICS_API_KEY = "sua-api-key"

# Executar deploy com IA
.\scripts\migration\migrate_complete.ps1
```

**Nota**: Se não configurados, a aplicação funcionará com dados simulados de IA.

## 📊 Monitoramento da Migração

### Durante a Execução
Os scripts fornecem output colorido indicando:
- ✅ **Verde**: Sucesso
- ❌ **Vermelho**: Erro
- ⚠️ **Amarelo**: Aviso
- 🔄 **Azul**: Em progresso

### Arquivo de Configuração Gerado
O arquivo `azure_ad_config.json` contém:
```json
{
  "AzureAD": {
    "ClientId": "uuid-gerado",
    "TenantId": "uuid-do-tenant",
    "ObjectId": "uuid-do-objeto",
    "AppName": "Nome da Aplicação"
  },
  "Deployment": {
    "Infrastructure": {
      "ResourceGroup": "nome-do-rg",
      "Application": {
        "URL": "https://sua-app.azurecontainerapps.io"
      },
      "Database": {
        "Server": "servidor.postgres.database.azure.com",
        "ConnectionString": "string-de-conexao"
      }
    }
  }
}
```

## 🔒 Considerações de Segurança

### Credenciais Importantes
⚠️ **ATENÇÃO**: As seguintes informações são críticas e devem ser guardadas com segurança:

1. **Password da Base de Dados**: Gerada automaticamente durante o deploy
2. **Connection String**: Contém credenciais de acesso à base de dados
3. **Client ID e Tenant ID**: Necessários para autenticação
4. **Arquivo de Configuração**: Contém informações sensíveis

### Boas Práticas
- Mantenha o arquivo `azure_ad_config.json` seguro e com backup
- Não commite credenciais no controle de versão
- Use Azure Key Vault para produção (opcional)
- Implemente rotação de passwords regulares

## 🚨 Resolução de Problemas

### Problemas Comuns

#### 1. Erro de Login Azure
```
Error: Please run 'az login' to setup account.
```
**Solução**: Execute `az login` e tente novamente

#### 2. Permissões Insuficientes
```
Error: Insufficient privileges to complete the operation.
```
**Solução**: Verifique se tem permissões de Contributor na subscription

#### 3. Nome do Registry Já Existe
```
Error: The registry name 'printcloudregistry' is not available.
```
**Solução**: Use um nome diferente com o parâmetro `-RegistryName`

#### 4. Falha na Build Docker
```
Error: Failed to build container image
```
**Solução**: Verifique se o Dockerfile está correto e as dependências estão instaladas

### Logs Detalhados
Para debugging, execute com verbose:
```powershell
.\scripts\migration\migrate_complete.ps1 -Verbose
```

## ✅ Validação Pós-Migração

### Checklist de Verificação
- [ ] Aplicação acessível na URL fornecida
- [ ] Login Azure AD funcional
- [ ] Base de dados conectada e funcional
- [ ] Todas as funcionalidades testadas
- [ ] Configuração salva e com backup

### Testes Funcionais
1. **Acesso à Aplicação**: Abrir URL da aplicação
2. **Autenticação**: Login com conta Azure AD
3. **Funcionalidades**: Testar recursos principais
4. **Performance**: Verificar tempos de resposta
5. **Logs**: Verificar logs da aplicação no Azure
6. **🤖 IA Assistente**: Testar chat e análises inteligentes
7. **📊 Insights**: Verificar recomendações e padrões gerados

## 🔄 Migração Reversa

Para reverter ou migrar novamente:
1. Apague o resource group criado: `az group delete --name rg-printcloud-prod`
2. Remova o App Registration do Azure AD
3. Delete o arquivo `azure_ad_config.json`
4. Execute a migração novamente

## 📞 Suporte

### Em Caso de Problemas
1. Verifique os logs detalhados dos scripts
2. Consulte a documentação oficial do Azure
3. Verifique permissões e quotas da subscription
4. Entre em contato com o administrador Azure

### Links Úteis
- [Documentação Azure Container Apps](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Next.js Documentation](https://nextjs.org/docs)

---

> ✅ **Sucesso**: Com estes scripts e documentação, você pode migrar o Print Cloud para qualquer conta Azure de forma automática e confiável.