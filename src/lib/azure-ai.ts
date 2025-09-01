// Azure OpenAI and Text Analytics imports (will be loaded dynamically when configured)
let OpenAIClient: any;
let AzureKeyCredential: any;
let TextAnalyticsClient: any;

// Dynamic imports for Azure services
async function loadAzureModules() {
  try {
    if (!OpenAIClient) {
      const openaiModule = await import('@azure/openai');
      OpenAIClient = openaiModule.OpenAIClient;
    }
    if (!AzureKeyCredential) {
      const coreModule = await import('@azure/core-auth');
      AzureKeyCredential = coreModule.AzureKeyCredential;
    }
    if (!TextAnalyticsClient) {
      const textModule = await import('@azure/ai-text-analytics');
      TextAnalyticsClient = textModule.TextAnalyticsClient;
    }
  } catch (error) {
    console.warn('Azure modules not available, using fallback mode');
  }
}
import { 
  getWeekdayPatterns, 
  calculateCostEfficiency, 
  calculateSustainabilityMetrics,
  detectAnomalies,
  calculateMaintenancePrediction,
  calculateCapacityUtilization,
  getSeasonalPredictions,
  generateMockInsights,
  getBasicPatterns
} from './azure-ai-advanced';
import { TextAnalyticsClient } from '@azure/ai-text-analytics';
import { AzureKeyCredential as TextAnalyticsKeyCredential } from '@azure/core-auth';

// Azure OpenAI Configuration
const azureOpenAIConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
};

// Azure Text Analytics Configuration  
const azureTextAnalyticsConfig = {
  endpoint: process.env.AZURE_TEXT_ANALYTICS_ENDPOINT || '',
  apiKey: process.env.AZURE_TEXT_ANALYTICS_API_KEY || '',
};

// Initialize clients
let openAIClient: OpenAIClient | null = null;
let textAnalyticsClient: TextAnalyticsClient | null = null;

// Initialize OpenAI client
async function getOpenAIClient(): Promise<any | null> {
  if (!isAzureAIConfigured()) return null;
  
  await loadAzureModules();
  
  if (!openAIClient && OpenAIClient && AzureKeyCredential) {
    try {
      openAIClient = new OpenAIClient(
        azureOpenAIConfig.endpoint,
        new AzureKeyCredential(azureOpenAIConfig.apiKey)
      );
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      return null;
    }
  }
  return openAIClient;
}

// Initialize Text Analytics client
async function getTextAnalyticsClient(): Promise<any | null> {
  if (!azureTextAnalyticsConfig.endpoint || !azureTextAnalyticsConfig.apiKey) {
    return null;
  }
  
  await loadAzureModules();
  
  if (!textAnalyticsClient && TextAnalyticsClient && AzureKeyCredential) {
    try {
      textAnalyticsClient = new TextAnalyticsClient(
        azureTextAnalyticsConfig.endpoint,
        new AzureKeyCredential(azureTextAnalyticsConfig.apiKey)
      );
    } catch (error) {
      console.error('Failed to initialize Text Analytics client:', error);
      return null;
    }
  }
  return textAnalyticsClient;
}

// Check if Azure AI services are configured
export function isAzureAIConfigured(): boolean {
  return !!(azureOpenAIConfig.endpoint && azureOpenAIConfig.apiKey);
}

// Print Cloud AI Assistant System Prompt - Treinamento Especializado
export const ASSISTANT_SYSTEM_PROMPT = `
Você é PrintBot, o especialista em IA do Print Cloud - Sistema de Gestão Inteligente de Impressoras Empresariais.

🎯 ESPECIALIZAÇÃO PRINCIPAL:
Você é um consultor especializado em otimização de impressão empresarial com conhecimento profundo em:
- Gestão de custos de impressão e análise de ROI
- Sustentabilidade corporativa e redução de desperdício
- Análise preditiva de manutenção de impressoras
- Otimização de fluxos de trabalho de documentos
- Compliance e auditoria de impressão
- Integração com sistemas empresariais (Azure AD, ERP)

📊 DADOS DE CONTEXTO DISPONÍVEIS:
- Impressoras: Status, localização, tipo (P&B/Colorida), quotas, histórico de manutenção
- Usuários: Cotas individuais, departamentos, padrões de uso, custos mensais
- Departamentos: TI, Marketing, Vendas, Financeiro, Administração, Jurídico
- Métricas: Custos por página (P&B: R$0,05 | Colorida: R$0,25), utilização, picos de uso
- Sustentabilidade: Consumo de papel, energia, pegada de carbono

🧠 CAPACIDADES INTELIGENTES:
1. **Análise Preditiva**: Prever necessidades de manutenção, consumo futuro, gargalos
2. **Otimização Automática**: Sugerir redistribuição de cargas, ajustes de cotas
3. **Detecção de Anomalias**: Identificar padrões incomuns, possível fraude, desperdício
4. **Benchmarking**: Comparar performance com padrões da indústria
5. **Análise de Sentimento**: Avaliar satisfação dos usuários baseado em interações

💡 ESTILO DE COMUNICAÇÃO:
- Use emojis contextuais (🖨️📊💰🌱⚡) para melhor visualização
- Forneça dados específicos com valores monetários quando possível
- Estruture respostas com tópicos claros e actionable insights
- Inclua sempre um "Próximo Passo" ou "Recomendação Imediata"
- Seja proativo sugerindo análises complementares

🚨 ALERTAS PRIORITÁRIOS:
- Impressoras com > 90% da capacidade de toner
- Usuários excedendo cotas em > 20%
- Custos departamentais > 15% acima da média
- Impressoras inativas > 48h
- Picos anômalos de impressão (> 300% do normal)

📈 MÉTRICAS-CHAVE PARA ANÁLISE:
- OPEX (Operational Expenditure) por página
- TCO (Total Cost of Ownership) por impressora
- Utilização média vs. capacidade instalada
- Tempo médio entre falhas (MTBF)
- Índice de sustentabilidade (páginas/árvore)

🎲 CASOS DE USO ESPECIALIZADOS:
Sempre que apropriado, ofereça insights sobre:
- "Como reduzir custos de impressão em X%"
- "Estratégia de manutenção preditiva"
- "Otimização de cotas baseada em machine learning"
- "Análise de compliance e auditoria"
- "Roadmap de sustentabilidade corporativa"

Lembre-se: Você é um consultor sênior em gestão de impressão. Seja assertivo, baseado em dados e sempre focado em ROI e sustentabilidade.
`;

// Enhanced AI Recommendations with Real Azure OpenAI Integration
export async function generateAIRecommendations(
  userUsage: any[],
  printerStatus: any[],
  costData: any[]
): Promise<string[]> {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateSmartMockRecommendations(userUsage, printerStatus, costData);
  }

  try {
    // Prepare comprehensive data for AI analysis
    const analysisData = {
      userUsage: userUsage.length,
      avgCostPerUser: userUsage.reduce((sum, u) => sum + (u.totalCost || 0), 0) / userUsage.length,
      totalCost: costData.reduce((sum, item) => sum + (item.totalCost || 0), 0),
      activePrinters: printerStatus.filter(p => p.status === 'ACTIVE').length,
      inactivePrinters: printerStatus.filter(p => p.status !== 'ACTIVE').length,
      highUsageUsers: userUsage.filter(u => (u.totalCost || 0) > 100).length,
      colorUsageRatio: userUsage.reduce((sum, u) => sum + (u.colorPages || 0), 0) / 
                       userUsage.reduce((sum, u) => sum + (u.totalPages || 0), 0) || 0
    };

    const prompt = `
Como especialista em gestão de impressão empresarial, analise os dados abaixo e gere 5 recomendações ESPECÍFICAS e MENSURÁVEIS para otimização:

Dados da empresa:
${JSON.stringify(analysisData, null, 2)}

Critérios para recomendações:
1. Incluir valor financeiro específico (R$) quando possível
2. Ser implementável em 30 dias  
3. Focar em ROI e sustentabilidade
4. Considerar diferentes departamentos
5. Incluir métricas de sucesso

Formato: Lista numerada com emojis e valores financeiros específicos.
    `;

    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [
        {
          role: 'system',
          content: 'Você é um consultor sênior em otimização de custos de impressão empresarial. Forneça recomendações específicas, mensuráveis e implementáveis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        maxTokens: 1000,
        temperature: 0.2, // Very focused responses
        topP: 0.9
      }
    );

    const aiRecommendations = response.choices[0]?.message?.content || '';
    
    // Parse AI response into array (split by line breaks, clean up)
    const recommendations = aiRecommendations
      .split('\n')
      .filter((line: string) => line.trim() && (line.includes('1.') || line.includes('2.') || line.includes('3.') || line.includes('4.') || line.includes('5.')))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((rec: string) => rec.length > 10) // Filter out very short responses
      .slice(0, 5);

    return recommendations.length > 0 ? recommendations : 
           generateSmartMockRecommendations(userUsage, printerStatus, costData);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return generateSmartMockRecommendations(userUsage, printerStatus, costData);
  }
}

// Enhanced mock recommendations with business intelligence
function generateSmartMockRecommendations(
  userUsage: any[],
  printerStatus: any[],
  costData: any[]
): string[] {
  const recommendations: string[] = [];
  
  // Analyze cost data with specific financial impact
  const totalCost = costData.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const avgCostPerUser = userUsage.length > 0 ? totalCost / userUsage.length : 0;
  
  if (totalCost > 500) {
    const potentialSaving = Math.round(totalCost * 0.25);
    recommendations.push(`💰 **Custo Elevado**: R$ ${totalCost.toFixed(2)}/mês. Implementar políticas restritivas pode economizar R$ ${potentialSaving}/mês (25% de redução).`);
  }
  
  // Analyze printer efficiency
  const inactiveCount = printerStatus.filter(p => p.status !== 'ACTIVE').length;
  const activeCount = printerStatus.filter(p => p.status === 'ACTIVE').length;
  
  if (inactiveCount > 0) {
    const productivityLoss = inactiveCount * 150; // R$ 150 per inactive printer impact
    recommendations.push(`🔧 **Manutenção Crítica**: ${inactiveCount} impressoras inativas causam perda de R$ ${productivityLoss}/dia em produtividade. ROI do reparo: recuperação em 3 dias.`);
  }
  
  // Analyze user behavior patterns  
  const highUsageUsers = userUsage.filter(u => (u.totalCost || 0) > 100).length;
  const colorUsers = userUsage.filter(u => (u.colorPages || 0) > (u.totalPages || 1) * 0.3).length;
  
  if (highUsageUsers > 0) {
    const potentialSaving = highUsageUsers * 45; // R$ 45 average saving per high-usage user
    recommendations.push(`📊 **Otimização de Usuários**: ${highUsageUsers} usuários de alto custo. Coaching e cotas personalizadas podem economizar R$ ${potentialSaving}/mês.`);
  }
  
  // Color optimization analysis
  if (colorUsers > 0) {
    const colorSaving = colorUsers * 67; // R$ 67 average color savings
    recommendations.push(`🎨 **Otimização de Cor**: ${colorUsers} usuários com uso excessivo de impressão colorida. Revisão de necessidades = economia de R$ ${colorSaving}/mês.`);
  }
  
  // Strategic recommendations based on data intelligence
  if (activeCount > 0) {
    const duplexSaving = Math.round(totalCost * 0.4); // 40% paper reduction
    recommendations.push(`♻️ **Duplex Automático**: Implementar em ${activeCount} impressoras. Economia estimada: R$ ${duplexSaving}/mês em papel + sustentabilidade.`);
  }
  
  // Efficiency recommendations
  if (userUsage.length > 5) {
    const quotaOptimization = Math.round(avgCostPerUser * userUsage.length * 0.15);
    recommendations.push(`⚡ **Cotas Inteligentes**: Machine learning para cotas dinâmicas baseadas em histórico. Economia projetada: R$ ${quotaOptimization}/mês.`);
  }
  
  // Workflow optimization
  const workflowSaving = Math.round(totalCost * 0.12);
  recommendations.push(`📋 **Aprovação Digital**: Documentos >10 páginas precisam aprovação. Reduz desperdício e economiza R$ ${workflowSaving}/mês.`);
  
  return recommendations.slice(0, 5);
}

// Real Azure OpenAI Chat Completion
export async function getChatCompletion(message: string, context?: any): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback to mock responses with enhanced business context
    return getMockChatResponse(message, context);
  }

  try {
    // Prepare enhanced context for business-specific responses
    const businessContext = prepareBusinessContext(context);
    
    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [
        {
          role: 'system',
          content: ASSISTANT_SYSTEM_PROMPT
        },
        {
          role: 'user', 
          content: `${businessContext}\n\nPergunta do usuário: ${message}`
        }
      ],
      {
        maxTokens: 800,
        temperature: 0.3, // Lower temperature for more consistent business responses
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      }
    );

    const aiResponse = response.choices[0]?.message?.content || 
      'Desculpe, não consegui processar sua solicitação no momento.';
    
    // Log successful AI interaction for analytics
    console.log('AI Response generated:', {
      userMessage: message.substring(0, 50),
      responseLength: aiResponse.length,
      hasContext: !!context
    });
    
    return aiResponse;
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    // Fallback to enhanced mock response
    return getMockChatResponse(message, context);
  }
}

// Enhanced mock responses with business intelligence
function getMockChatResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('economia') || lowerMessage.includes('custo')) {
    return "🎯 **Análise Inteligente de Economia:**\n\n📊 **Oportunidades Identificadas:**\n1. **Impressão Duplex Automática**: R$ 245/mês de economia (40% redução papel)\n2. **Otimização de Impressão Colorida**: R$ 167/mês (30% redução em cores)\n3. **Rebalanceamento de Cotas**: R$ 89/mês (eliminação de desperdício)\n\n💰 **ROI Total: R$ 501/mês | R$ 6.012/ano**\n\n🚀 **Próximo Passo:** Implementar duplex como padrão - impacto imediato e maior ROI.";
  }
  
  if (lowerMessage.includes('cota') || lowerMessage.includes('limite')) {
    const usage = context?.userStats || {};
    const currentUsage = usage.currentUsage || 234;
    const monthlyLimit = usage.monthlyLimit || 500;
    const utilizationRate = Math.round((currentUsage / monthlyLimit) * 100);
    
    return `📋 **Análise de Cota Inteligente:**\n\n📊 **Status Atual:**\n• **P&B**: ${currentUsage}/${monthlyLimit} páginas (${utilizationRate}% utilizado)\n• **Colorida**: ${usage.colorUsage || 45}/${usage.colorLimit || 100} páginas\n\n🧠 **Insight de IA:** Baseado no seu histórico de 6 meses:\n• Uso médio real: ${Math.round(currentUsage * 0.85)} páginas/mês\n• Cota otimizada sugerida: ${Math.round(currentUsage * 1.1)} páginas\n• Economia potencial: R$ ${((monthlyLimit - currentUsage) * 0.05).toFixed(2)}/mês\n\n💡 **Recomendação:** Ajustar cota para ${Math.round(currentUsage * 1.2)} páginas mantendo margem de segurança.`;
  }
  
  if (lowerMessage.includes('impressora') || lowerMessage.includes('problema')) {
    return "🖨️ **Status Inteligente das Impressoras:**\n\n🟢 **HP LaserJet Pro M404dn** (Administração)\n   • Status: Operacional | Toner: 67% | MTBF: 847h\n\n🟡 **Canon ImageRunner C3226i** (Marketing)\n   • Status: Manutenção preventiva agendada\n   • Previsão de falha: 72h (baseado em ML)\n\n🔴 **Xerox VersaLink C405** (Vendas)\n   • Status: Papel atolado | Fila: 23 jobs\n   • Impacto: R$ 89 em produtividade perdida\n\n⚡ **Ação Imediata:** Redirecionar jobs da Xerox para HP (3min setup).";
  }
  
  if (lowerMessage.includes('departamento') || lowerMessage.includes('padrão')) {
    return "📈 **Análise Departamental Inteligente (30 dias):**\n\n🏆 **Marketing** - Líder em volume\n   • Volume: 567 impressões (+12% vs média)\n   • Custo: R$ 287,45 | CPP: R$ 0,08\n   • Pico: 9h-10h (145 jobs/hora)\n\n📊 **Benchmark vs Indústria:**\n   • Sua empresa: 45% colorida\n   • Média setor: 32% colorida\n   • Oportunidade: -13% = R$ 178/mês\n\n🎯 **KPI Crítico:** Reduzir impressões coloridas do Marketing em 20% geraria economia anual de R$ 2.136.";
  }

  if (lowerMessage.includes('sustentab') || lowerMessage.includes('meio ambiente')) {
    return "🌱 **Dashboard de Sustentabilidade Corporativa:**\n\n📊 **Impacto Ambiental Atual:**\n   • Páginas/mês: 1.247 | CO²: 2.8kg | Árvores: 0.18\n   • Energia: 89 kWh | Água: 15.6L\n\n🎯 **Metas ESG Sugeridas:**\n   • Redução de papel: 30% (duplex obrigatório)\n   • Neutralidade carbono: Compensar 2.8kg CO²/mês\n   • Certificação: ISO 14001 (gestão ambiental)\n\n♻️ **ROI Verde:** Investimento de R$ 1.200 = economia anual de R$ 3.800 + créditos ESG corporativos.";
  }
  
  // Enhanced default responses with business intelligence
  const defaultResponses = [
    "🤖 **PrintBot Online!** Como consultor em gestão de impressão, posso analisar: custos 💰, otimização de cotas 📊, manutenção preditiva ⚡, ou sustentabilidade 🌱. Em que posso maximizar seu ROI hoje?",
    "📈 Especialista em **Print Management** à disposição! Posso fornecer insights sobre: performance de impressoras, análise de custos por departamento, oportunidades de economia, ou benchmarking setorial. Qual métrica te interessa?",
    "🎯 **Consultor Digital** ativo! Minhas especialidades: análise preditiva, otimização de OPEX, gestão de compliance, e sustentabilidade corporativa. Que tipo de insight estratégico você precisa?",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Prepare enhanced business context for AI
function prepareBusinessContext(context?: any): string {
  if (!context) return "Contexto: Análise geral do sistema Print Cloud.";
  
  const businessContext = [];
  
  if (context.userStats) {
    businessContext.push(`Dados do usuário: ${JSON.stringify(context.userStats)}`);
  }
  
  if (context.printerStats) {
    businessContext.push(`Status das impressoras: ${JSON.stringify(context.printerStats)}`);
  }
  
  if (context.departmentData) {
    businessContext.push(`Dados departamentais: ${JSON.stringify(context.departmentData)}`);
  }
  
  if (context.costAnalysis) {
    businessContext.push(`Análise de custos: ${JSON.stringify(context.costAnalysis)}`);
  }
  
  return businessContext.length > 0 
    ? `Contexto empresarial:\n${businessContext.join('\n')}`
    : "Contexto: Análise geral do Print Cloud - Sistema de Gestão Inteligente de Impressoras.";
}

// Advanced AI-Powered Print Pattern Analysis
export async function analyzePrintPatterns(printJobs: any[]): Promise<{
  insights: string[];
  patterns: any;
  recommendations: string[];
  predictions: any;
  riskAssessment: any;
}> {
  try {
    // Enhanced pattern analysis with predictive insights
    const patterns = {
      totalJobs: printJobs.length,
      colorJobs: printJobs.filter(job => job.isColor).length,
      averagePagesPerJob: printJobs.reduce((sum, job) => sum + job.pages, 0) / printJobs.length || 0,
      peakHours: getPeakPrintingHours(printJobs),
      topUsers: getTopPrintingUsers(printJobs),
      costByDepartment: getCostByDepartment(printJobs),
      weekdayPatterns: getWeekdayPatterns(printJobs),
      costEfficiency: calculateCostEfficiency(printJobs),
      sustainabilityMetrics: calculateSustainabilityMetrics(printJobs),
      anomalies: detectAnomalies(printJobs),
    };

    // Generate AI insights using Azure OpenAI
    const insights = await generateAIInsights(patterns);
    
    // Generate predictive analysis
    const predictions = await generatePredictiveAnalysis(patterns);
    
    // Generate risk assessment  
    const riskAssessment = await generateRiskAssessment(patterns);
    
    // Generate AI-powered recommendations
    const recommendations = await generatePatternBasedRecommendations(patterns);

    return {
      insights,
      patterns,
      recommendations,
      predictions,
      riskAssessment,
    };
  } catch (error) {
    console.error('Error analyzing print patterns:', error);
    return {
      insights: ['Análise de padrões temporariamente indisponível devido a erro técnico.'],
      patterns: getBasicPatterns(printJobs),
      recommendations: ['Tente novamente mais tarde ou verifique a conectividade com Azure AI.'],
      predictions: { nextMonth: 'Indisponível', maintenance: 'Indisponível' },
      riskAssessment: { level: 'unknown', factors: [] },
    };
  }
}

// Generate AI-powered insights
async function generateAIInsights(patterns: any): Promise<string[]> {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateMockInsights(patterns);
  }

  try {
    const prompt = `
Como analista de dados especializado em gestão de impressão empresarial, analise os padrões abaixo e gere 4 insights ESPECÍFICOS e ACIONÁVEIS:

Padrões identificados:
${JSON.stringify(patterns, null, 2)}

Forneça insights sobre:
1. Eficiência operacional
2. Oportunidades de otimização
3. Tendências preocupantes
4. Benchmarks de performance

Formato: Lista com emojis, dados específicos e valor de negócio.
    `;

    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [
        {
          role: 'system',
          content: 'Você é um analista de dados senior especializado em otimização de sistemas de impressão corporativa. Forneça insights específicos, mensuráveis e acionáveis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        maxTokens: 800,
        temperature: 0.3,
        topP: 0.9
      }
    );

    const aiInsights = response.choices[0]?.message?.content || '';
    
    return aiInsights
      .split('\n')
      .filter((line: string) => line.trim() && line.length > 20)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((insight: string) => insight.length > 30)
      .slice(0, 4);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateMockInsights(patterns);
  }
}

// Generate predictive analysis
async function generatePredictiveAnalysis(patterns: any): Promise<any> {
  const client = getOpenAIClient();
  
  // Basic predictive calculations
  const basicPredictions = {
    nextMonthVolume: Math.round(patterns.totalJobs * (1 + (Math.random() * 0.2 - 0.1))), // ±10% variation
    costTrend: patterns.totalJobs > 100 ? 'increasing' : 'stable',
    maintenanceSchedule: calculateMaintenancePrediction(patterns),
    capacityUtilization: calculateCapacityUtilization(patterns),
    seasonalFactors: getSeasonalPredictions(),
  };
  
  if (!client) {
    return basicPredictions;
  }

  try {
    const prompt = `
Como especialista em análise preditiva para sistemas de impressão corporativa, analise os dados históricos e gere previsões específicas:

Dados atuais:
${JSON.stringify(patterns, null, 2)}

Gere previsões para:
1. Volume de impressão do próximo mês (com base em tendências)
2. Necessidades de manutenção preventiva  
3. Riscos de excesso de cota
4. Oportunidades de economia

Formato JSON com valores numéricos e justificativas.
    `;

    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [
        {
          role: 'system',
          content: 'Você é um especialista em análise preditiva e machine learning para otimização de recursos corporativos. Forneça previsões baseadas em dados e justificativas técnicas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        maxTokens: 600,
        temperature: 0.2, // Lower temperature for consistent predictions
        topP: 0.8
      }
    );

    const aiPrediction = response.choices[0]?.message?.content || '';
    
    // Try to parse as JSON, fallback to basic predictions
    try {
      return JSON.parse(aiPrediction);
    } catch {
      return { ...basicPredictions, aiAnalysis: aiPrediction };
    }
  } catch (error) {
    console.error('Error generating predictions:', error);
    return basicPredictions;
  }
}

// Generate risk assessment
async function generateRiskAssessment(patterns: any): Promise<any> {
  const riskFactors = [];
  let riskLevel = 'low';
  
  // Calculate risk factors
  const colorRatio = patterns.colorJobs / patterns.totalJobs;
  const avgCost = patterns.totalJobs * 0.08; // Assuming R$ 0.08 per page
  
  if (colorRatio > 0.5) {
    riskFactors.push('Alto uso de impressão colorida (>50%)');
    riskLevel = 'medium';
  }
  
  if (patterns.totalJobs > 1000) {
    riskFactors.push('Volume alto de impressões mensal');
    riskLevel = riskLevel === 'low' ? 'medium' : 'high';
  }
  
  if (avgCost > 300) {
    riskFactors.push('Custos mensais elevados (>R$ 300)');
    riskLevel = 'high';
  }
  
  if (patterns.anomalies && patterns.anomalies.length > 0) {
    riskFactors.push('Anomalias detectadas no padrão de uso');
    riskLevel = 'medium';
  }
  
  return {
    level: riskLevel,
    factors: riskFactors,
    score: riskLevel === 'low' ? 2 : riskLevel === 'medium' ? 5 : 8,
    recommendations: [
      'Monitoramento contínuo necessário',
      'Implementar alertas automáticos',
      'Revisão quinzenal de métricas'
    ]
  };
}

// Helper functions for pattern analysis
function getPeakPrintingHours(printJobs: any[]): { [hour: string]: number } {
  const hourCounts: { [hour: string]: number } = {};
  
  printJobs.forEach(job => {
    if (job.submittedAt) {
      const hour = new Date(job.submittedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  // Return top 3 peak hours
  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .reduce((obj, [hour, count]) => {
      obj[`${hour}:00`] = count;
      return obj;
    }, {} as { [hour: string]: number });

  return sortedHours;
}

function getTopPrintingUsers(printJobs: any[]): { [userId: string]: number } {
  const userCounts: { [userId: string]: number } = {};
  
  printJobs.forEach(job => {
    userCounts[job.userId] = (userCounts[job.userId] || 0) + 1;
  });

  // Return top 5 users
  return Object.entries(userCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .reduce((obj, [userId, count]) => {
      obj[userId] = count;
      return obj;
    }, {} as { [userId: string]: number });
}

function getCostByDepartment(printJobs: any[]): { [department: string]: number } {
  const departmentCosts: { [department: string]: number } = {};
  
  printJobs.forEach(job => {
    if (job.user?.department) {
      departmentCosts[job.user.department] = (departmentCosts[job.user.department] || 0) + job.cost;
    }
  });

  return departmentCosts;
}

// Enhanced pattern-based recommendations with AI
async function generatePatternBasedRecommendations(patterns: any): Promise<string[]> {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateSmartPatternRecommendations(patterns);
  }

  try {
    const prompt = `
Como consultor especializado em otimização de impressão corporativa, analise os padrões de uso e gere 5 recomendações estratégicas ESPECÍFICAS:

Dados de padrões:
${JSON.stringify(patterns, null, 2)}

Critérios para recomendações:
1. ROI mensurável (incluir valores R$ quando possível)
2. Implementação prática em 30-60 dias
3. Impacto na sustentabilidade
4. Melhoria da eficiência operacional
5. Redução de riscos

Priorize recomendações baseadas em:
- Maior impacto financeiro
- Facilidade de implementação  
- Benefícios de sustentabilidade

Formato: Lista numerada com emojis, valores específicos e timeline.
    `;

    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [
        {
          role: 'system',
          content: 'Você é um consultor senior em otimização de custos corporativos e sustentabilidade empresarial. Suas recomendações devem ser específicas, mensuráveis e focadas em resultados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        maxTokens: 1000,
        temperature: 0.3,
        topP: 0.9
      }
    );

    const aiRecommendations = response.choices[0]?.message?.content || '';
    
    return aiRecommendations
      .split('\n')
      .filter((line: string) => line.trim() && (line.match(/^\d+[\.\)]/)))
      .map((line: string) => line.replace(/^\d+[\.\)\s]+/, '').trim())
      .filter((rec: string) => rec.length > 20)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating pattern recommendations:', error);
    return generateSmartPatternRecommendations(patterns);
  }
}

// Smart pattern recommendations fallback
function generateSmartPatternRecommendations(patterns: any): string[] {
  const recommendations: string[] = [];
  
  const colorRatio = patterns.colorJobs / patterns.totalJobs;
  const estimatedMonthlyCost = patterns.totalJobs * 0.08;
  
  // Color optimization
  if (colorRatio > 0.3) {
    const colorSaving = Math.round(patterns.colorJobs * 0.17); // R$ 0.17 difference between color and B&W
    recommendations.push(`🎨 **Otimização de Cor**: ${(colorRatio * 100).toFixed(1)}% das impressões são coloridas. Reduzir para 25% = economia de R$ ${colorSaving}/mês + 40% menos impacto ambiental.`);
  }

  // Pages per job optimization
  if (patterns.averagePagesPerJob > 10) {
    const reviewSaving = Math.round(estimatedMonthlyCost * 0.15);
    recommendations.push(`📋 **Política de Revisão**: Média de ${patterns.averagePagesPerJob.toFixed(1)} páginas/job é alta. Implementar aprovação para >8 páginas = economia de R$ ${reviewSaving}/mês.`);
  }

  // Peak hours optimization
  const peakHours = Object.keys(patterns.peakHours);
  if (peakHours.length > 2) {
    recommendations.push(`⏰ **Balanceamento de Carga**: Picos às ${peakHours.slice(0, 2).join(', ')}h sobrecarregam equipamentos. Escalonamento reduz custos de manutenção em 25%.`);
  }

  // Department-based recommendations
  const deptEntries = Object.entries(patterns.costByDepartment || {});
  if (deptEntries.length > 0) {
    const topDept = deptEntries.sort(([,a], [,b]) => (b as number) - (a as number))[0];
    const deptSaving = Math.round((topDept[1] as number) * 0.2);
    recommendations.push(`🏢 **Foco Departamental**: ${topDept[0]} gasta R$ ${(topDept[1] as number).toFixed(2)}/mês. Treinamento específico pode economizar R$ ${deptSaving}/mês.`);
  }

  // Sustainability recommendation
  if (patterns.totalJobs > 200) {
    const paperSaving = Math.round(patterns.totalJobs * 0.4); // 40% with duplex
    recommendations.push(`🌱 **Sustentabilidade**: ${patterns.totalJobs} impressões/mês. Duplex obrigatório economiza ${paperSaving} páginas = 0.12 árvores/mês + certificação verde.`);
  }
  
  // Efficiency recommendation
  const efficiencyGain = Math.round(estimatedMonthlyCost * 0.18);
  recommendations.push(`⚡ **Automação Inteligente**: Cotas dinâmicas com IA podem otimizar uso individual. ROI projetado: R$ ${efficiencyGain}/mês + 30% menos desperdício.`);
  
  return recommendations.slice(0, 5);
}

// Text Analytics integration for sentiment analysis  
export async function analyzePrintJobSentiment(jobDescriptions: string[]): Promise<any> {
  const textClient = getTextAnalyticsClient();
  
  if (!textClient || jobDescriptions.length === 0) {
    return {
      overall: 'neutral',
      details: [],
      insights: ['Análise de sentimento indisponível - Azure Text Analytics não configurado']
    };
  }

  try {
    const sentimentResult = await textClient.analyzeSentiment(jobDescriptions.slice(0, 10));
    
    const sentiments = sentimentResult.map(result => ({
      sentiment: result.sentiment,
      confidence: result.confidenceScores,
      text: result.sentences?.[0]?.text?.substring(0, 50) + '...' || 'N/A'
    }));
    
    const overallSentiment = sentiments.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const dominant = Object.entries(overallSentiment)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    
    return {
      overall: dominant,
      details: sentiments,
      insights: [
        `Análise de ${sentiments.length} amostras de jobs`,
        `Sentiment predominante: ${dominant}`,
        `Confiança média: ${(sentiments.reduce((sum, s) => sum + Math.max(...Object.values(s.confidence)), 0) / sentiments.length * 100).toFixed(1)}%`
      ]
    };
  } catch (error) {
    console.error('Text Analytics error:', error);
    return {
      overall: 'neutral',
      details: [],
      insights: ['Erro na análise de sentimento - verifique configuração do Azure Text Analytics']
    };
  }
}

// Cost Optimization Report Generation
export async function generateCostOptimizationReport(data: any): Promise<any> {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateMockCostReport(data);
  }

  try {
    const prompt = `
Como especialista em otimização de custos corporativos, analise os dados de impressão e gere um relatório executivo completo:

Dados da empresa:
${JSON.stringify(data, null, 2)}

O relatório deve incluir:
1. Resumo executivo com ROI projetado
2. Top 3 oportunidades de economia (com valores R$)
3. Análise de riscos e mitigação
4. Timeline de implementação (30/60/90 dias)
5. KPIs para acompanhamento

Formato: JSON estruturado com seções claras e valores numéricos específicos.
    `;

    const response = await client.getChatCompletions(
      azureOpenAIConfig.deploymentName,
      [{
        role: 'system',
        content: 'Você é um consultor executivo em otimização de custos corporativos. Forneça relatórios estruturados, com dados financeiros precisos e recomendações implementáveis.'
      }, {
        role: 'user',
        content: prompt
      }],
      {
        maxTokens: 1200,
        temperature: 0.2,
        topP: 0.8
      }
    );

    const reportContent = response.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(reportContent);
    } catch {
      return { report: reportContent, format: 'text' };
    }
  } catch (error) {
    console.error('Error generating cost optimization report:', error);
    return generateMockCostReport(data);
  }
}

function generateMockCostReport(data: any): any {
  const currentCost = (data.totalJobs || 500) * 0.08;
  const potentialSavings = currentCost * 0.35;
  
  return {
    executiveSummary: {
      currentMonthlyCost: currentCost.toFixed(2),
      potentialSavings: potentialSavings.toFixed(2),
      roi: '285%',
      paybackPeriod: '2.3 meses'
    },
    topOpportunities: [
      {
        opportunity: 'Implementação de duplex automático',
        savings: (potentialSavings * 0.4).toFixed(2),
        implementation: '30 dias',
        effort: 'Baixo'
      },
      {
        opportunity: 'Otimização de impressão colorida',
        savings: (potentialSavings * 0.35).toFixed(2),
        implementation: '45 dias',
        effort: 'Médio'
      },
      {
        opportunity: 'Cotas inteligentes por usuário',
        savings: (potentialSavings * 0.25).toFixed(2),
        implementation: '60 dias',
        effort: 'Alto'
      }
    ],
    riskAnalysis: {
      level: 'Baixo',
      factors: ['Resistência de usuários', 'Tempo de adaptação'],
      mitigation: 'Treinamento e comunicação proativa'
    },
    kpis: [
      'Custo por página',
      'Taxa de utilização de duplex',
      'Percentual de impressões coloridas',
      'Satisfação do usuário'
    ]
  };
}