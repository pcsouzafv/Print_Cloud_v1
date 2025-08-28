// For now, we'll implement a simple interface that uses mock data
// When Azure services are properly configured, this can be replaced with real Azure OpenAI calls

// Azure OpenAI Configuration
const azureOpenAIConfig = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
};

// Check if Azure AI services are configured
export function isAzureAIConfigured(): boolean {
  return !!(azureOpenAIConfig.endpoint && azureOpenAIConfig.apiKey);
}

// Print Cloud AI Assistant System Prompt
export const ASSISTANT_SYSTEM_PROMPT = `
Você é o assistente de IA do Print Cloud, um sistema de gestão de impressoras empresarial integrado com Azure AD.

Seu papel é ajudar os usuários com:
1. Análise de padrões de impressão e identificação de oportunidades de economia
2. Recomendações para otimização de custos de impressão
3. Sugestões de melhores práticas para uso sustentável
4. Análise de relatórios e métricas de impressão
5. Resolução de problemas comuns com impressoras
6. Orientações sobre cotas e políticas de impressão

Contexto da empresa:
- Sistema integrado com Azure Active Directory
- Controle de cotas por usuário e departamento
- Monitoramento de custos em tempo real
- Diferentes tipos de impressoras (P&B e coloridas)
- Departamentos: TI, Marketing, Vendas, Financeiro, Administração

Sempre seja:
- Profissional e prestativo
- Focado em economia e sustentabilidade
- Baseado em dados quando disponível
- Claro e objetivo nas respostas
- Proativo em sugerir melhorias

Se não tiver informações suficientes, peça esclarecimentos específicos sobre:
- Período de análise desejado
- Departamento ou usuário específico
- Tipo de relatório ou métrica
- Problema específico com impressora
`;

// Helper function to generate AI recommendations
export async function generateAIRecommendations(
  userUsage: any[],
  printerStatus: any[],
  costData: any[]
): Promise<string[]> {
  // For now, return mock recommendations based on data patterns
  // This will be replaced with actual Azure OpenAI calls when configured
  
  const recommendations: string[] = [];
  
  // Analyze cost data
  const totalCost = costData.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  if (totalCost > 500) {
    recommendations.push('Custo mensal elevado detectado. Considere implementar políticas de impressão mais restritivas.');
  }
  
  // Analyze printer status
  const inactiveCount = printerStatus.filter(p => p.status !== 'ACTIVE').length;
  if (inactiveCount > 0) {
    recommendations.push(`${inactiveCount} impressoras precisam de manutenção. Priorize os reparos para otimizar recursos.`);
  }
  
  // Analyze user usage
  const highUsageUsers = userUsage.filter(u => u.totalCost > 100).length;
  if (highUsageUsers > 0) {
    recommendations.push(`${highUsageUsers} usuários com custos elevados. Considere revisar suas necessidades de impressão.`);
  }
  
  // Add general recommendations
  recommendations.push(
    'Implemente impressão duplex automática para reduzir consumo de papel em 40%.',
    'Configure quotas dinâmicas baseadas no histórico de cada usuário.',
    'Estabeleça políticas de aprovação para documentos grandes (>10 páginas).'
  );
  
  return recommendations.slice(0, 5); // Return up to 5 recommendations
}

// Helper function for chat completion
export async function getChatCompletion(message: string, context?: any): Promise<string> {
  // For now, use mock responses based on message content
  // This will be replaced with actual Azure OpenAI calls when configured
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('economia') || lowerMessage.includes('custo')) {
    return "📊 Identifiquei várias oportunidades de economia para você:\n\n1. **Impressão Duplex**: Ativando por padrão, você pode economizar até R$ 245/mês em papel\n2. **Otimização de Cor**: 45% das suas impressões são coloridas. Revisar a necessidade pode reduzir custos em 30%\n3. **Gestão de Cotas**: Suas cotas atuais têm 15% de desperdício\n\n💡 Implementando essas 3 mudanças, a economia total seria de aproximadamente **R$ 380/mês**!";
  }
  
  if (lowerMessage.includes('cota') || lowerMessage.includes('limite')) {
    const usage = context?.userStats || {};
    return `📋 **Status da sua Cota:**\n\n• **P&B**: ${usage.currentUsage || 234}/${usage.monthlyLimit || 500} páginas (${Math.round((usage.currentUsage || 234) / (usage.monthlyLimit || 500) * 100)}% usado)\n• **Colorida**: ${usage.colorUsage || 45}/${usage.colorLimit || 100} páginas\n\nVocê está dentro dos limites! 👍\n\n💡 **Dica**: Com base no seu histórico, você poderia ter uma cota menor e ainda assim atender suas necessidades.`;
  }
  
  if (lowerMessage.includes('impressora') || lowerMessage.includes('problema')) {
    return "🖨️ **Status das Impressoras:**\n\n• **HP LaserJet Pro M404dn**: ✅ Ativa (Administração)\n• **Canon ImageRunner C3226i**: ⚠️ Manutenção agendada (Marketing)\n• **Xerox VersaLink C405**: ❌ Erro de papel (Vendas)\n\nA impressora da Vendas precisa de atenção! Já notifiquei o suporte técnico.";
  }
  
  if (lowerMessage.includes('departamento') || lowerMessage.includes('padrão')) {
    return "📈 **Padrões do Departamento (últimos 30 dias):**\n\n• **Marketing**: Maior uso (567 impressões)\n• **Pico de uso**: 9h-10h (145 impressões/hora)\n• **Tipo preferido**: 55% P&B, 45% Colorida\n• **Custo médio**: R$ 0,08/página\n\n🎯 **Insight**: Seu departamento está 12% acima da média da empresa em impressões coloridas.";
  }

  if (lowerMessage.includes('sustentab') || lowerMessage.includes('meio ambiente')) {
    return "🌱 **Impacto Ambiental:**\n\n• **Páginas impressas**: 1.247 este mês\n• **Economia potencial**: 623 páginas (50%) com duplex\n• **Árvores salvas**: ~0.15 árvores/mês com otimização\n• **CO² reduzido**: ~2.3kg/mês\n\n♻️ **Recomendações Verdes**:\n1. Ativar duplex automático\n2. Usar modo rascunho para documentos internos\n3. Revisar antes de imprimir";
  }
  
  // Default helpful responses
  const defaultResponses = [
    "Como posso ajudá-lo com o sistema de impressão? Posso fornecer informações sobre custos, cotas, status das impressoras ou dicas de economia.",
    "Estou aqui para otimizar seu uso de impressão! Gostaria de saber sobre suas cotas atuais, oportunidades de economia ou status das impressoras?",
    "Posso analisar seus padrões de impressão e sugerir melhorias. Que tipo de informação você gostaria de obter?",
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Analyze print patterns and generate insights
export async function analyzePrintPatterns(printJobs: any[]): Promise<{
  insights: string[];
  patterns: any;
  recommendations: string[];
}> {
  try {
    // Basic pattern analysis
    const patterns = {
      totalJobs: printJobs.length,
      colorJobs: printJobs.filter(job => job.isColor).length,
      averagePagesPerJob: printJobs.reduce((sum, job) => sum + job.pages, 0) / printJobs.length || 0,
      peakHours: getPeakPrintingHours(printJobs),
      topUsers: getTopPrintingUsers(printJobs),
      costByDepartment: getCostByDepartment(printJobs),
    };

    // Generate AI insights based on patterns
    const insights: string[] = [];
    
    // Color usage insight
    const colorRatio = patterns.colorJobs / patterns.totalJobs;
    if (colorRatio > 0.4) {
      insights.push(`Alto uso de impressão colorida detectado (${(colorRatio * 100).toFixed(1)}%). Oportunidade de economia significativa.`);
    } else if (colorRatio < 0.1) {
      insights.push(`Baixo uso de impressão colorida (${(colorRatio * 100).toFixed(1)}%). Excelente controle de custos!`);
    }
    
    // Pages per job insight
    if (patterns.averagePagesPerJob > 10) {
      insights.push(`Média alta de páginas por job (${patterns.averagePagesPerJob.toFixed(1)}). Considere implementar políticas de revisão.`);
    }
    
    // Peak hours insight
    const peakHours = Object.keys(patterns.peakHours);
    if (peakHours.length > 0) {
      insights.push(`Picos de impressão identificados às ${peakHours.slice(0, 2).join(' e ')}h. Considere balanceamento de carga.`);
    }
    
    // Department cost insight  
    const departmentEntries = Object.entries(patterns.costByDepartment);
    if (departmentEntries.length > 0) {
      const topDept = departmentEntries.sort(([,a], [,b]) => b - a)[0];
      insights.push(`Departamento ${topDept[0]} lidera em custos (R$ ${topDept[1].toFixed(2)}). Revisar necessidades específicas.`);
    }
    
    // Generate recommendations based on patterns
    const recommendations = await generatePatternBasedRecommendations(patterns);

    return {
      insights,
      patterns,
      recommendations,
    };
  } catch (error) {
    console.error('Error analyzing print patterns:', error);
    return {
      insights: ['Análise de padrões temporariamente indisponível.'],
      patterns: {},
      recommendations: ['Tente novamente mais tarde.'],
    };
  }
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

async function generatePatternBasedRecommendations(patterns: any): Promise<string[]> {
  const recommendations: string[] = [];

  // Color vs B&W analysis
  const colorRatio = patterns.colorJobs / patterns.totalJobs;
  if (colorRatio > 0.3) {
    recommendations.push(`Alto uso de impressão colorida (${(colorRatio * 100).toFixed(1)}%). Considere revisar a necessidade de impressões coloridas.`);
  }

  // Pages per job analysis
  if (patterns.averagePagesPerJob > 10) {
    recommendations.push(`Média alta de páginas por job (${patterns.averagePagesPerJob.toFixed(1)}). Considere implementar revisão prévia ou impressão duplex.`);
  }

  // Peak hours analysis
  const peakHours = Object.keys(patterns.peakHours);
  if (peakHours.length > 0) {
    recommendations.push(`Picos de impressão identificados às ${peakHours.join(', ')}. Considere distribuir a carga ou aumentar capacidade nesses horários.`);
  }

  return recommendations;
}