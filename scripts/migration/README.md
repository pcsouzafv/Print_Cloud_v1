# 🚀 Scripts de Migração - Print Cloud

## 📝 Resumo Rápido

Scripts PowerShell para migração completa do Print Cloud para qualquer conta Microsoft/Azure.

### Uso Rápido
```powershell
# Migração automática completa
.\migrate_complete.ps1

# Ou passo a passo
.\01_prereqs_check.ps1
.\02_configure_azure_ad.ps1  
.\03_deploy_infrastructure.ps1
.\04_update_redirect_uris.ps1
.\05_run_migrations.ps1
```

## 📋 Scripts Disponíveis

| Script | Descrição | Tempo Estimado |
|--------|-----------|----------------|
| `migrate_complete.ps1` | **Migração completa automatizada** | 15-20 min |
| `01_prereqs_check.ps1` | Verificação de pré-requisitos | 1-2 min |
| `02_configure_azure_ad.ps1` | Criação e configuração Azure AD | 2-3 min |
| `03_deploy_infrastructure.ps1` | Deploy da infraestrutura Azure | 8-12 min |
| `04_update_redirect_uris.ps1` | Atualização redirect URIs | 1 min |
| `05_run_migrations.ps1` | Migrações da base de dados | 2-3 min |

## 🎯 Pré-requisitos

- ✅ Azure CLI instalado e logado (`az login`)
- ✅ Docker Desktop instalado e executando
- ✅ Node.js v18+ instalado
- ✅ Permissões Azure (Contributor + App Administrator)

## ⚡ Uso dos Scripts

### Script Principal (Recomendado)

```powershell
# Migração padrão
.\migrate_complete.ps1

# Com parâmetros personalizados
.\migrate_complete.ps1 `
    -AppName "Minha Aplicação" `
    -ResourceGroup "rg-meuapp-prod" `
    -Location "East US"

# Pular verificação de pré-requisitos (desenvolvimento)
.\migrate_complete.ps1 -SkipPrereqs

# Output detalhado (debugging)
.\migrate_complete.ps1 -Verbose
```

### Scripts Individuais

```powershell
# 1. Verificar pré-requisitos
.\01_prereqs_check.ps1

# 2. Configurar Azure AD
.\02_configure_azure_ad.ps1 -AppName "Minha App"

# 3. Deploy infraestrutura
.\03_deploy_infrastructure.ps1 -ResourceGroup "meu-rg"

# 4. Atualizar redirect URIs
.\04_update_redirect_uris.ps1

# 5. Migrar base de dados
.\05_run_migrations.ps1
```

## 📊 Output dos Scripts

### Códigos de Status
- 🟢 **Exit 0**: Sucesso
- 🔴 **Exit 1**: Erro crítico
- 🟡 **Warnings**: Continuam execução

### Arquivo de Configuração
Os scripts geram `azure_ad_config.json` contendo:
- Credenciais Azure AD (Client ID, Tenant ID)
- URLs da aplicação
- Configurações da infraestrutura
- String de conexão da base de dados

## 🔧 Parâmetros Principais

### migrate_complete.ps1
| Parâmetro | Descrição | Padrão |
|-----------|-----------|--------|
| `-AppName` | Nome da app Azure AD | "Print Cloud Production" |
| `-ResourceGroup` | Nome do resource group | "rg-printcloud-prod" |
| `-Location` | Região Azure | "Brazil South" |
| `-ConfigFile` | Arquivo de configuração | "azure_ad_config.json" |
| `-SkipPrereqs` | Pular verificação pré-requisitos | false |
| `-Verbose` | Output detalhado | false |

## 🚨 Resolução de Problemas

### Problemas Comuns

#### Azure CLI não logado
```
❌ Azure Login: Not logged in
```
**Solução**: `az login`

#### Docker não executando
```
❌ Docker: Not installed or not running
```
**Solução**: Iniciar Docker Desktop

#### Permissões insuficientes
```
❌ Error: Insufficient privileges
```
**Solução**: Verificar permissões Azure (Contributor + App Admin)

#### Nome do registry já existe
```
❌ The registry name 'printcloudregistry' is not available
```
**Solução**: Usar nome único ou adicionar sufixo aleatório

### Debugging
```powershell
# Executar com logs detalhados
.\migrate_complete.ps1 -Verbose

# Verificar configuração gerada
Get-Content azure_ad_config.json | ConvertFrom-Json | Format-Table

# Verificar recursos criados
az resource list --resource-group rg-printcloud-prod --output table
```

## 📁 Estrutura de Arquivos Gerada

```
Print_Cloud_v1/
├── azure_ad_config.json     # ← Configuração gerada
├── scripts/migration/
│   ├── *.ps1               # Scripts de migração
│   └── README.md           # Este arquivo
└── ...resto do projeto
```

## 🔄 Migração Reversa

Para desfazer a migração:

```powershell
# 1. Apagar resource group
az group delete --name rg-printcloud-prod --yes

# 2. Apagar app registration (opcional)
az ad app delete --id CLIENT_ID_DA_APP

# 3. Limpar configuração local
Remove-Item azure_ad_config.json
```

## ✅ Validação Pós-Migração

```powershell
# Verificar recursos criados
az resource list --resource-group rg-printcloud-prod

# Testar aplicação
Start-Process (Get-Content azure_ad_config.json | ConvertFrom-Json).Deployment.Infrastructure.Application.URL

# Verificar base de dados
az postgres flexible-server list --resource-group rg-printcloud-prod
```

## 📞 Suporte

- 📖 Documentação completa: `../../MIGRATION_GUIDE.md`
- 🐛 Problemas: Verificar logs dos scripts
- 💡 Dicas: Usar `-Verbose` para debugging

---

> 🎯 **Dica**: Para primeira migração, use `migrate_complete.ps1`. Para debugging ou customização avançada, use scripts individuais.