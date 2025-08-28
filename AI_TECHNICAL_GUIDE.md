# 🤖 Guia Técnico - Integração IA no Print Cloud

## 📋 Visão Geral

O Print Cloud integra serviços de IA da Microsoft Azure para fornecer análises inteligentes, recomendações personalizadas e um assistente conversacional. O sistema foi projetado com fallback inteligente, funcionando com dados simulados quando os serviços Azure AI não estão configurados.

## 🏗️ Arquitetura da IA

### Componentes Principais

```
Frontend (React)     API Routes (Next.js)     Azure AI Services
┌─────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│ AI Assistant    │──│ /api/ai/chat         │──│ Azure OpenAI     │
│ AI Insights     │──│ /api/ai/analysis     │──│ Text Analytics   │
│ Recommendations │──│ /api/ai/recommendations│ │ (Fallback: Mock) │
└─────────────────┘  └──────────────────────┘  └──────────────────┘
```

### Serviços Azure Utilizados

1. **Azure OpenAI Service**
   - Modelo: GPT-3.5-turbo
   - Função: Chat conversacional e geração de insights
   - Endpoint: `AZURE_OPENAI_ENDPOINT`

2. **Azure Text Analytics**
   - Função: Análise de sentimento e extração de insights
   - Endpoint: `AZURE_TEXT_ANALYTICS_ENDPOINT`

## 📁 Estrutura de Arquivos

```
src/
├── components/ai/
│   ├── ai-assistant.tsx      # Componente chat conversacional
│   └── ai-insights.tsx       # Dashboard de insights IA
├── app/api/ai/
│   ├── chat/route.ts         # Endpoint chat conversacional
│   ├── analysis/route.ts     # Endpoint análise de padrões
│   └── recommendations/route.ts # Endpoint recomendações
└── lib/
    ├── azure-ai.ts          # Cliente Azure AI Services
    └── mock-ai.ts           # Sistema de fallback mock
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Desenvolvimento (.env.local)
```env
# Azure AI Services - Development (usa dados simulados se vazio)
AZURE_OPENAI_ENDPOINT=""
AZURE_OPENAI_API_KEY=""
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-35-turbo"
AZURE_TEXT_ANALYTICS_ENDPOINT=""
AZURE_TEXT_ANALYTICS_API_KEY=""
```

#### Produção (.env)
```env
# Azure AI Services - Production
AZURE_OPENAI_ENDPOINT="https://seu-openai.openai.azure.com/"
AZURE_OPENAI_API_KEY="sua-api-key-secreta"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-35-turbo"
AZURE_TEXT_ANALYTICS_ENDPOINT="https://seu-text-analytics.cognitiveservices.azure.com/"
AZURE_TEXT_ANALYTICS_API_KEY="sua-text-analytics-key"
```

#### Docker (docker-compose.yml)
```yaml
environment:
  - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
  - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
  - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-35-turbo}
  - AZURE_TEXT_ANALYTICS_ENDPOINT=${AZURE_TEXT_ANALYTICS_ENDPOINT}
  - AZURE_TEXT_ANALYTICS_API_KEY=${AZURE_TEXT_ANALYTICS_API_KEY}
```

## 🔀 Sistema de Fallback

### Detecção de Configuração
```typescript
// src/lib/mock-ai.ts
export function isAzureAIConfigured(): boolean {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT && 
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT !== "mock-endpoint"
  );
}
```

### Comportamento por Ambiente

| Ambiente | Azure AI Configurado | Comportamento |
|----------|---------------------|---------------|
| Desenvolvimento | ❌ | Usa dados simulados inteligentes |
| Desenvolvimento | ✅ | Usa Azure AI Services |
| Produção | ❌ | Usa dados simulados + log de aviso |
| Produção | ✅ | Usa Azure AI Services |

## 🤖 Funcionalidades IA

### 1. Assistente Conversacional

**Componente:** `src/components/ai/ai-assistant.tsx`
**API:** `/api/ai/chat`

#### Recursos:
- Chat em tempo real integrado no dashboard
- Respostas contextuais baseadas em dados do usuário
- Sugestões automáticas de perguntas
- Interface expansível/retraível

#### Exemplo de Uso:
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Como posso reduzir custos de impressão?",
    userId: "user-123",
    includeContext: true
  })
});
```

### 2. Análise de Padrões

**Componente:** `src/components/ai/ai-insights.tsx`
**API:** `/api/ai/analysis`

#### Recursos:
- Análise de tendências de uso por período
- Identificação de padrões por departamento
- Detecção de anomalias de uso
- Métricas de eficiência e sustentabilidade

#### Parâmetros Suportados:
```typescript
interface AnalysisParams {
  period: string;      // "7", "30", "90" dias
  department?: string; // Filtro por departamento
  userId?: string;     // Análise específica do usuário
}
```

### 3. Recomendações Inteligentes

**API:** `/api/ai/recommendations`

#### Tipos de Recomendações:
- **cost**: Otimização de custos
- **sustainability**: Práticas sustentáveis
- **efficiency**: Melhoria de eficiência
- **general**: Recomendações gerais

#### Exemplo de Resposta:
```json
{
  "recommendations": [
    "Configure impressão duplex como padrão para reduzir consumo de papel em 50%",
    "3 usuários com custos acima de R$ 50/mês. Considere revisar necessidades de impressão"
  ],
  "potentialSavings": {
    "duplexPrinting": 150.00,
    "colorOptimization": 80.50,
    "totalPotential": 230.50
  }
}
```

## 💾 Dados Simulados (Mock)

### Características dos Dados Mock

1. **Realísticos**: Baseados em padrões reais de impressão empresarial
2. **Dinâmicos**: Variam baseados no tempo e contexto
3. **Consistentes**: Mantêm coerência entre chamadas
4. **Personalizados**: Adaptam-se ao contexto do usuário

### Padrões de Resposta

```typescript
// Chat responses com base em palavras-chave
const chatPatterns = {
  cost: ["reduzir custos", "economizar", "barato"],
  sustainability: ["sustentável", "meio ambiente", "papel"],
  efficiency: ["eficiência", "otimizar", "melhorar"],
  technical: ["problema", "erro", "não funciona"]
};
```

## 🔌 APIs de Integração

### POST /api/ai/chat
```typescript
interface ChatRequest {
  message: string;
  userId?: string;
  includeContext?: boolean;
}

interface ChatResponse {
  response: string;
  suggestions?: string[];
  context?: UserContext;
}
```

### GET /api/ai/analysis
```typescript
interface AnalysisResponse {
  insights: InsightData[];
  trends: TrendData[];
  anomalies: AnomalyData[];
  summary: {
    totalSavings: number;
    efficiencyScore: number;
    sustainabilityRating: string;
  };
}
```

### GET /api/ai/recommendations
```typescript
interface RecommendationsResponse {
  recommendations: string[];
  potentialSavings: {
    duplexPrinting: number;
    colorOptimization: number;
    quotaOptimization: number;
    totalPotential: number;
  };
  dataAnalysis: {
    userUsage: number;
    printerStatus: number;
    totalCost: number;
  };
}
```

## 🚀 Deploy e Configuração

### Azure Services Setup

1. **Criar Azure OpenAI Service**
   ```bash
   az cognitiveservices account create \
     --name "printcloud-openai" \
     --resource-group "rg-printcloud" \
     --kind OpenAI \
     --sku S0 \
     --location "East US"
   ```

2. **Deploy do Modelo GPT-3.5-turbo**
   ```bash
   az cognitiveservices account deployment create \
     --name "printcloud-openai" \
     --resource-group "rg-printcloud" \
     --deployment-name "gpt-35-turbo" \
     --model-name "gpt-35-turbo" \
     --model-version "0613" \
     --sku-capacity 10 \
     --sku-name "Standard"
   ```

3. **Criar Text Analytics**
   ```bash
   az cognitiveservices account create \
     --name "printcloud-textanalytics" \
     --resource-group "rg-printcloud" \
     --kind TextAnalytics \
     --sku S \
     --location "East US"
   ```

### Container Apps Configuration

As variáveis são configuradas automaticamente via Azure Key Vault:

```yaml
secrets:
  - name: azure-openai-endpoint
    value: "https://printcloud-openai.openai.azure.com/"
  - name: azure-openai-api-key
    value: "key-from-keyvault"
```

## 🔍 Monitoramento e Debugging

### Logs Importantes

```typescript
// Verificar configuração IA
console.log('Azure AI Configured:', isAzureAIConfigured());

// Log de fallback
if (!isAzureAIConfigured()) {
  console.log('Using mock AI responses for development');
}

// Monitorar chamadas API
console.log('AI API Call:', { endpoint, method, params });
```

### Health Checks

O sistema inclui verificações automáticas:

```typescript
// src/lib/azure-ai.ts
export async function testAzureConnection(): Promise<boolean> {
  try {
    // Test OpenAI connection
    const response = await getChatCompletion("test");
    return response.length > 0;
  } catch (error) {
    console.error('Azure AI connection failed:', error);
    return false;
  }
}
```

## 🛠️ Desenvolvimento

### Testes Locais

1. **Sem Azure AI** (dados simulados):
   ```bash
   npm run dev
   # IA funcionará com dados mock inteligentes
   ```

2. **Com Azure AI** (desenvolvimento):
   ```bash
   # Configure .env.local com credenciais reais
   export AZURE_OPENAI_ENDPOINT="https://..."
   export AZURE_OPENAI_API_KEY="sk-..."
   npm run dev
   ```

### Extensibilidade

Para adicionar novas funcionalidades IA:

1. **Criar nova API route**: `src/app/api/ai/nova-funcionalidade/route.ts`
2. **Implementar lógica Azure**: `src/lib/azure-ai.ts`
3. **Adicionar fallback mock**: `src/lib/mock-ai.ts`
4. **Criar componente UI**: `src/components/ai/nova-funcionalidade.tsx`

## 📊 Métricas e Performance

### Custos Estimados (Azure)

| Serviço | Uso Mensal | Custo Estimado |
|---------|------------|----------------|
| Azure OpenAI (GPT-3.5-turbo) | 100k tokens | $0.10-$2.00 |
| Text Analytics | 10k chamadas | $1.00-$5.00 |
| **Total IA Services** | - | **$1.10-$7.00/mês** |

### Performance

- **Tempo resposta Azure AI**: 1-3 segundos
- **Tempo resposta Mock**: 0.5-1.5 segundos
- **Cache TTL**: 5 minutos (análises)
- **Rate Limit**: 10 req/min por usuário

## 🔒 Considerações de Segurança

### Dados Sensíveis

- ❌ **Nunca envie**: Senhas, tokens de acesso, PII
- ✅ **Seguro enviar**: Estatísticas agregadas, padrões de uso
- 🔒 **Sempre criptografe**: API keys no Azure Key Vault

### Validação de Input

```typescript
function sanitizeUserInput(message: string): string {
  return message
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 1000)       // Limit message length
    .trim();
}
```

---

**Print Cloud IA** - Transformando dados em insights inteligentes 🧠