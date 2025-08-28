# 🤖 Guia de Configuração - Azure AI Services

Este guia mostrará como configurar os serviços de IA da Microsoft para o assistente inteligente do Print Cloud.

## 🚀 Serviços Necessários

### 1. Azure OpenAI Service
Usado para o assistente conversacional e geração de insights inteligentes.

### 2. Azure Text Analytics (opcional)
Para análise avançada de sentimentos e extração de insights de texto.

---

## 📋 Pré-requisitos

- Subscription ativa do Azure
- Permissões para criar recursos no Azure
- Azure CLI instalado (opcional)

---

## 🛠️ Configuração Passo a Passo

### Passo 1: Criar Azure OpenAI Service

1. **Acesse o Portal do Azure**
   - Vá para [portal.azure.com](https://portal.azure.com)
   - Faça login com sua conta

2. **Criar o recurso**
   ```bash
   # Via Azure CLI (opcional)
   az cognitiveservices account create \
     --name "printcloud-openai" \
     --resource-group "rg-printcloud" \
     --kind "OpenAI" \
     --sku "S0" \
     --location "East US"
   ```

   Ou via Portal:
   - Procure por "OpenAI" no marketplace
   - Clique em "Create"
   - Configure:
     - **Name**: `printcloud-openai`
     - **Resource Group**: `rg-printcloud`
     - **Location**: `East US` (ou região preferida)
     - **Pricing Tier**: `Standard S0`

3. **Deploy do modelo**
   - Após criação, vá para o recurso
   - Navegue para "Model deployments"
   - Clique "Create new deployment"
   - Configure:
     - **Model**: `gpt-35-turbo` ou `gpt-4`
     - **Deployment name**: `gpt-35-turbo`
     - **Version**: Mais recente

### Passo 2: Obter credenciais

1. **OpenAI Service**
   - No recurso criado, vá para "Keys and Endpoint"
   - Copie:
     - **Endpoint**: `https://printcloud-openai.openai.azure.com/`
     - **Key**: `sua-chave-aqui`

### Passo 3: Configurar Text Analytics (Opcional)

1. **Criar recurso**
   - Procure por "Text Analytics" no marketplace
   - Configure:
     - **Name**: `printcloud-textanalytics`
     - **Pricing Tier**: `Free F0` ou `Standard S`

2. **Obter credenciais**
   - Copie o endpoint e chave

---

## ⚙️ Configuração do Print Cloud

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu `.env`:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT="https://printcloud-openai.openai.azure.com/"
AZURE_OPENAI_API_KEY="sua-chave-openai-aqui"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-35-turbo"

# Azure Text Analytics (opcional)
AZURE_TEXT_ANALYTICS_ENDPOINT="https://printcloud-textanalytics.cognitiveservices.azure.com/"
AZURE_TEXT_ANALYTICS_API_KEY="sua-chave-text-analytics-aqui"
```

### 2. Testar a configuração

1. **Reinicie a aplicação**
   ```bash
   npm run dev
   ```

2. **Teste o assistente**
   - Acesse a aplicação
   - Clique no botão "Assistente IA" 
   - Envie uma mensagem de teste

---

## 🎯 Funcionalidades Disponíveis

### ✅ Com Azure AI configurado:
- **Assistente Conversacional**: Respostas contextuais baseadas em dados reais
- **Análise de Padrões**: Insights inteligentes sobre uso de impressão
- **Recomendações Personalizadas**: Sugestões específicas baseadas em IA
- **Detecção de Anomalias**: Identificação automática de padrões incomuns

### 🔄 Sem Azure AI (Modo Mock):
- **Dados simulados**: Funcionalidade completa com respostas pré-definidas
- **Desenvolvimento local**: Teste todas as funcionalidades sem custos
- **Demonstrações**: Perfeito para apresentações e testes

---

## 💰 Estimativa de Custos

### Azure OpenAI Service:
- **Modelo gpt-35-turbo**: ~$0.002 por 1K tokens
- **Uso estimado**: 100-500 chamadas/dia = $5-25/mês

### Text Analytics:
- **Free Tier**: 5.000 transações/mês grátis
- **Standard**: $1 por 1.000 transações

**Total estimado**: $5-30/mês dependendo do uso

---

## 🔧 Troubleshooting

### Erro: "OpenAI endpoint not configured"
- Verifique se `AZURE_OPENAI_ENDPOINT` está correto
- Confirme se o endpoint termina com `/`

### Erro: "Authentication failed"
- Verifique se `AZURE_OPENAI_API_KEY` está correto
- Confirme se a chave não expirou

### Erro: "Deployment not found"
- Verifique se `AZURE_OPENAI_DEPLOYMENT_NAME` corresponde ao nome do deployment
- Confirme se o modelo foi deployado corretamente

### Erro: "Rate limit exceeded"
- Aguarde alguns minutos e tente novamente
- Considere aumentar o tier do serviço

---

## 🛡️ Boas Práticas de Segurança

1. **Nunca commite chaves no código**
   - Use variáveis de ambiente
   - Adicione `.env` ao `.gitignore`

2. **Rotacione as chaves regularmente**
   - Azure permite 2 chaves ativas
   - Rode uma enquanto atualiza a outra

3. **Configure alertas de custo**
   - Defina limites no Azure Portal
   - Configure notificações por email

4. **Use roles de menor privilégio**
   - Crie service principals específicos
   - Conceda apenas permissões necessárias

---

## 📚 Recursos Adicionais

- [Documentação Azure OpenAI](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [Best Practices Guide](https://docs.microsoft.com/azure/cognitive-services/openai/concepts/best-practices)

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `console.log` nas APIs de IA
2. **Teste no Azure Portal**: Use o playground do OpenAI
3. **Consulte a documentação**: Links acima
4. **Abra uma issue**: No repositório do projeto

---

**🎉 Depois de configurado, você terá um assistente de IA completamente funcional integrado ao Print Cloud!**