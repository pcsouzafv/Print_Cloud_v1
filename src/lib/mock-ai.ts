// Mock AI services for development/testing when Azure services aren't configured

export const mockAIResponses = {
  chatResponses: [
    "Baseado nos seus padrões de impressão, recomendo implementar impressão duplex padrão para reduzir custos em até 30%.",
    "Observei que você tem usado muito impressão colorida. Para otimizar custos, considere revisar quais documentos realmente necessitam de cor.",
    "Suas impressões estão concentradas nas manhãs. Considere distribuir a carga ao longo do dia para melhor eficiência.",
    "Identifiquei 3 oportunidades de economia no seu departamento. Gostaria que eu detalhe cada uma delas?",
    "Com base no histórico, você está usando apenas 60% da sua cota mensal. Isso indica boa gestão de recursos!",
  ],

  insights: [
    "Alto padrão de impressão colorida detectado - 45% do total",
    "Picos de impressão identificados entre 9h-10h",
    "Economia de 23% possível com impressão duplex",
    "Usuários do Marketing excedem cota em 15% mensalmente",
    "3 impressoras subutilizadas no departamento Financeiro",
  ],

  recommendations: [
    "Implementar política de impressão duplex obrigatória - economia estimada: R$ 245/mês",
    "Revisar necessidade de impressões coloridas - possível redução de 30% nos custos",
    "Redistribuir carga das impressoras para balanceamento - melhoria de 25% na eficiência",
    "Configurar quotas dinâmicas baseadas no histórico - otimização de recursos",
    "Implementar aprovação para documentos acima de 10 páginas - controle de desperdício",
  ],

  patterns: {
    totalJobs: 1247,
    colorJobs: 562,
    averagePagesPerJob: 8.3,
    peakHours: { "9:00": 145, "10:00": 132, "14:00": 98 },
    topUsers: {
      "user1": 89,
      "user2": 76,
      "user3": 65,
      "user4": 54,
      "user5": 48,
    },
    costByDepartment: {
      "Marketing": 567.89,
      "Vendas": 423.45,
      "Administração": 234.67,
      "TI": 189.23,
      "Financeiro": 145.78,
    },
  },
};

export function getMockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('economia') || lowerMessage.includes('custo')) {
    return "📊 Identifiquei várias oportunidades de economia para você:\n\n1. **Impressão Duplex**: Ativando por padrão, você pode economizar até R$ 245/mês em papel\n2. **Otimização de Cor**: 45% das suas impressões são coloridas. Revisar a necessidade pode reduzir custos em 30%\n3. **Gestão de Cotas**: Suas cotas atuais têm 15% de desperdício\n\n💡 Implementando essas 3 mudanças, a economia total seria de aproximadamente **R$ 380/mês**!";
  }
  
  if (lowerMessage.includes('cota') || lowerMessage.includes('limite')) {
    return "📋 **Status da sua Cota:**\n\n• **P&B**: 234/500 páginas (47% usado)\n• **Colorida**: 45/100 páginas (45% usado)\n\nVocê está dentro dos limites! 👍\n\n💡 **Dica**: Com base no seu histórico, você poderia ter uma cota menor e ainda assim atender suas necessidades, gerando economia para a empresa.";
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
  
  // Default response
  const responses = mockAIResponses.chatResponses;
  return responses[Math.floor(Math.random() * responses.length)];
}

export function getMockAnalysisData(period: number = 30) {
  return {
    analysis: {
      insights: mockAIResponses.insights.slice(0, 4),
      patterns: mockAIResponses.patterns,
      recommendations: mockAIResponses.recommendations.slice(0, 3),
    },
    stats: {
      totalJobs: mockAIResponses.patterns.totalJobs,
      totalPages: mockAIResponses.patterns.totalJobs * mockAIResponses.patterns.averagePagesPerJob,
      totalCost: 234.56,
      colorJobs: mockAIResponses.patterns.colorJobs,
      averageCostPerPage: 0.08,
      topDepartments: Object.entries(mockAIResponses.patterns.costByDepartment)
        .map(([department, cost]) => ({
          department,
          jobs: Math.floor(Math.random() * 200) + 50,
          cost,
          pages: Math.floor(cost * 12),
        })),
      dailyTrends: generateMockDailyTrends(period),
    },
    period,
  };
}

export function getMockRecommendations() {
  return {
    recommendations: Array.isArray(mockAIResponses.recommendations) ? mockAIResponses.recommendations : [],
    potentialSavings: {
      duplexPrinting: 245.67,
      colorOptimization: 134.23,
      quotaOptimization: 89.45,
      totalPotential: 469.35,
      currentMonthlyCost: 1567.89,
      annualPotential: 5632.20,
      roi: 295.5,
      paybackMonths: 3.2,
      confidenceLevel: 'mock',
      implementationComplexity: 'medium'
    },
    dataAnalysis: {
      userUsage: 25,
      printerStatus: 8,
      totalCost: 1567.89,
    },
  };
}

function generateMockDailyTrends(days: number) {
  const trends = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseJobs = 40;
    const variation = Math.random() * 20 - 10; // -10 to +10
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.2 : 1;
    
    const jobs = Math.max(0, Math.floor((baseJobs + variation) * weekendMultiplier));
    const cost = jobs * (0.05 + Math.random() * 0.1); // R$ 0.05-0.15 per page
    const pages = jobs * (3 + Math.random() * 8); // 3-11 pages per job
    
    trends.push({
      date: date.toISOString().split('T')[0],
      jobs,
      cost: Math.round(cost * 100) / 100,
      pages: Math.floor(pages),
    });
  }
  
  return trends;
}

// Check if Azure AI services are configured
export function isAzureAIConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT && 
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_TEXT_ANALYTICS_ENDPOINT &&
    process.env.AZURE_TEXT_ANALYTICS_API_KEY
  );
}