# 🔐 Guia Completo: Configurar GitHub Secrets para Deploy Azure

## Passo 1: Criar Service Principal no Portal Azure

### 1.1 Acesse o Portal Azure
- Vá para: https://portal.azure.com
- Faça login com sua conta

### 1.2 Criar App Registration
1. No menu esquerdo, clique em **"Microsoft Entra ID"** (ou "Azure Active Directory")
2. No menu lateral, clique em **"App registrations"**
3. Clique em **"+ New registration"** (no topo)
4. Preencha:
   - **Name**: `printcloud-github-actions`
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**: deixe em branco
5. Clique em **"Register"**

### 1.3 Copiar Client ID
- Após criar, você verá a página do app
- **COPIE** o valor de **"Application (client) ID"** 
- Exemplo: `12345678-1234-1234-1234-123456789012`

### 1.4 Criar Client Secret
1. No menu lateral esquerdo, clique em **"Certificates & secrets"**
2. Na aba **"Client secrets"**, clique em **"+ New client secret"**
3. Preencha:
   - **Description**: `GitHub Actions Secret`
   - **Expires**: `24 months` (recomendado)
4. Clique em **"Add"**
5. **COPIE IMEDIATAMENTE** o valor da coluna **"Value"** (só aparece uma vez!)
   - Exemplo: `abcdef123456789~AbCdEf-GhIjKlMnOpQrStUvWxYz`

### 1.5 Dar Permissão ao Service Principal
1. No menu superior do Azure, procure por **"Subscriptions"**
2. Clique na sua subscription: **"Azure subscription 1"**
3. No menu lateral, clique em **"Access control (IAM)"**
4. Clique em **"+ Add"** → **"Add role assignment"**
5. Na aba **"Role"**:
   - Selecione **"Contributor"**
   - Clique em **"Next"**
6. Na aba **"Members"**:
   - **Assign access to**: "User, group, or service principal"
   - Clique em **"+ Select members"**
   - Digite: `printcloud-github-actions`
   - Selecione o app e clique em **"Select"**
7. Clique em **"Review + assign"** → **"Assign"**

## Passo 2: Configurar Secrets no GitHub

### 2.1 Acessar Página de Secrets
- Vá para: https://github.com/pcsouzafv/Print_Cloud_v1
- Clique na aba **"Settings"** (no topo do repositório)
- No menu lateral esquerdo, clique em **"Secrets and variables"** → **"Actions"**

### 2.2 Adicionar AZURE_CREDENTIALS
1. Clique em **"New repository secret"**
2. **Name**: `AZURE_CREDENTIALS`
3. **Secret**: Cole este JSON (substitua os valores):
```json
{
  "clientId": "SEU_CLIENT_ID_COPIADO_DO_AZURE",
  "clientSecret": "SEU_CLIENT_SECRET_COPIADO_DO_AZURE",
  "subscriptionId": "62221c55-00a3-42a0-b11d-89f949d14861",
  "tenantId": "4e478318-c461-4365-8da2-f6b0809542b1"
}
```
4. Clique em **"Add secret"**

### 2.3 Adicionar REGISTRY_PASSWORD  
1. Clique em **"New repository secret"** novamente
2. **Name**: `REGISTRY_PASSWORD`
3. **Secret**: `[USAR_O_PASSWORD_DO_CONTAINER_REGISTRY_DO_AZURE]`
4. Clique em **"Add secret"**

## Passo 3: Testar o Deploy

### 3.1 Fazer um Push
- Após configurar os secrets, faça qualquer alteração no código
- Execute: `git add .` → `git commit -m "trigger deploy"` → `git push`

### 3.2 Acompanhar o Deploy
- Vá para: https://github.com/pcsouzafv/Print_Cloud_v1/actions
- Clique no workflow que está executando
- Acompanhe os logs de cada step

## 🎯 URLs Importantes

- **Repositório GitHub**: https://github.com/pcsouzafv/Print_Cloud_v1
- **Portal Azure**: https://portal.azure.com
- **Aplicação Deployada**: https://printcloud-app-prod.wittypebble-a8e9df9c.eastus.azurecontainerapps.io

## 🆘 Se Algo Der Errado

1. **Verifique os secrets**: nomes exatos e valores corretos
2. **Verifique permissões**: Service Principal precisa ser Contributor
3. **Verifique o JSON**: formato correto do AZURE_CREDENTIALS
4. **Verifique os logs**: GitHub Actions mostra erros detalhados

## 📞 Valores de Referência

- **Subscription ID**: `62221c55-00a3-42a0-b11d-89f949d14861`
- **Tenant ID**: `4e478318-c461-4365-8da2-f6b0809542b1`  
- **Registry Password**: [Obter do Azure Container Registry]
- **Resource Group**: `rg-printcloud-prod`
- **Container Registry**: `printcloudregistry1756467509`