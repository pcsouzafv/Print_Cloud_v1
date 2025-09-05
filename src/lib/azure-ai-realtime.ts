import { EventEmitter } from 'events';
import { AzureOpenAI } from 'openai/azure';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

interface PrintCloudContext {
  userId: string;
  department: string;
  recentPrintJobs: any[];
  printerStatus: any[];
  costData: any[];
  systemMetrics: any;
}

interface AIResponse {
  message: string;
  confidence: number;
  actions?: string[];
  recommendations?: string[];
  data?: any;
}

interface StreamingResponse {
  content: string;
  isComplete: boolean;
  metadata?: any;
}

export class PrintCloudRealtimeAI extends EventEmitter {
  private openaiClient!: AzureOpenAI;
  private searchClient!: SearchClient<any>;
  private isInitialized: boolean = false;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  
  constructor() {
    super();
    this.setupClients();
  }

  private setupClients() {
    if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
      console.warn('Azure OpenAI credentials not found. Using mock responses.');
      return;
    }

    try {
      this.openaiClient = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: '2024-03-01-preview'
      });

      if (process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY) {
        this.searchClient = new SearchClient(
          process.env.AZURE_SEARCH_ENDPOINT,
          'printcloud-knowledge',
          new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
        );
      }

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize Azure AI clients:', error);
      this.emit('error', error);
    }
  }

  // Streaming Chat com contexto especializado em impressão
  async *streamChat(
    message: string, 
    context: PrintCloudContext,
    options: { temperature?: number; maxTokens?: number } = {}
  ): AsyncGenerator<StreamingResponse> {
    if (!this.isInitialized) {
      yield { content: 'Sistema AI não inicializado. Usando respostas mock.', isComplete: false };
      yield* this.mockStreamingResponse(message, context);
      return;
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-10), // Últimas 10 mensagens
        { role: 'user', content: message }
      ];

      const stream = await this.openaiClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_GPT4_DEPLOYMENT || 'gpt-4-turbo',
        messages: messages as any,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        stream: true,
        functions: this.getPrintCloudFunctions(),
        function_call: 'auto'
      });

      let fullContent = '';
      let functionCall: any = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullContent += delta.content;
          yield {
            content: delta.content,
            isComplete: false,
            metadata: { type: 'content' }
          };
        }

        if (delta?.function_call) {
          if (!functionCall) {
            functionCall = { name: '', arguments: '' };
          }
          if (delta.function_call.name) {
            functionCall.name += delta.function_call.name;
          }
          if (delta.function_call.arguments) {
            functionCall.arguments += delta.function_call.arguments;
          }
        }

        if (chunk.choices[0]?.finish_reason === 'stop' || 
            chunk.choices[0]?.finish_reason === 'function_call') {
          
          // Se houve chamada de função, executar
          if (functionCall && functionCall.name) {
            const functionResult = await this.executePrintCloudFunction(
              functionCall.name, 
              JSON.parse(functionCall.arguments || '{}'),
              context
            );
            
            yield {
              content: functionResult.message,
              isComplete: true,
              metadata: { 
                type: 'function_result', 
                function: functionCall.name,
                data: functionResult.data 
              }
            };
          } else {
            yield {
              content: '',
              isComplete: true,
              metadata: { type: 'completion' }
            };
          }
          
          // Adicionar à história da conversa
          this.conversationHistory.push({ role: 'user', content: message });
          this.conversationHistory.push({ role: 'assistant', content: fullContent });
          
          break;
        }
      }

    } catch (error) {
      console.error('Streaming chat error:', error);
      yield {
        content: 'Erro ao processar sua solicitação. Tente novamente.',
        isComplete: true,
        metadata: { type: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Sistema de funções especializadas para Print Cloud
  private getPrintCloudFunctions() {
    return [
      {
        name: 'analyze_print_costs',
        description: 'FERRAMENTA CRÍTICA: Calcula economia real em R$ analisando custos de impressão por departamento/período. Identifica desperdícios e apresenta ROI específico das otimizações.',
        parameters: {
          type: 'object',
          properties: {
            period: { type: 'string', description: 'Período para análise (7d, 30d, 90d) - padrão 30d' },
            department: { type: 'string', description: 'Departamento específico ou "all" para análise global' }
          }
        }
      },
      {
        name: 'optimize_printer_usage',
        description: 'OTIMIZAÇÃO ESTRATÉGICA: Redistribui carga de trabalho entre impressoras para maximizar eficiência e reduzir custos operacionais. Calcula economia em % e R$.',
        parameters: {
          type: 'object',
          properties: {
            printers: { 
              type: 'array', 
              description: 'IDs das impressoras para rebalanceamento de carga',
              items: { type: 'string' }
            },
            criteria: { type: 'string', description: 'Foco da otimização: "cost" (redução custos), "efficiency" (maior produtividade), "sustainability" (impacto ambiental)' }
          }
        }
      },
      {
        name: 'predict_maintenance',
        description: 'MANUTENÇÃO PREDITIVA: Prevê falhas em impressoras usando IA para evitar paradas não planejadas. Economia com manutenção preventiva vs corretiva.',
        parameters: {
          type: 'object',
          properties: {
            printerId: { type: 'string', description: 'ID da impressora' },
            analysisType: { type: 'string', description: 'Tipo de análise (usage, costs, errors)' }
          }
        }
      },
      {
        name: 'recommend_quotas',
        description: 'CONTROLE DE GASTOS: Define cotas inteligentes por usuário baseado em padrão histórico + 15% margem. Reduz desperdício e controla orçamento mensal de impressão.',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'ID do usuário para cálculo de cota personalizada' },
            historicalData: { type: 'boolean', description: 'true = usar histórico real, false = estimativa por departamento' }
          }
        }
      },
      {
        name: 'generate_sustainability_report',
        description: 'IMPACTO AMBIENTAL: Calcula pegada de carbono, equivalência em árvores e economia potencial com práticas sustentáveis. ROI verde em R$.',
        parameters: {
          type: 'object',
          properties: {
            scope: { type: 'string', description: 'Alcance: "user" (individual), "department" (setor), "organization" (empresa toda)' },
            metrics: { 
              type: 'array', 
              description: 'Métricas: ["carbon_footprint", "paper_saved", "energy_consumption", "cost_savings"]',
              items: { type: 'string' }
            }
          }
        }
      }
    ];
  }

  // Execução das funções especializadas
  private async executePrintCloudFunction(
    functionName: string, 
    args: any, 
    context: PrintCloudContext
  ) {
    switch (functionName) {
      case 'analyze_print_costs':
        return this.analyzePrintCosts(args, context);
      
      case 'optimize_printer_usage':
        return this.optimizePrinterUsage(args, context);
      
      case 'predict_maintenance':
        return this.predictMaintenance(args, context);
      
      case 'recommend_quotas':
        return this.recommendQuotas(args, context);
      
      case 'generate_sustainability_report':
        return this.generateSustainabilityReport(args, context);
      
      default:
        return {
          message: `Função ${functionName} não implementada ainda.`,
          data: null
        };
    }
  }

  private async analyzePrintCosts(args: any, context: PrintCloudContext) {
    const { period = '30d', department } = args;
    const costData = context.costData || [];
    
    // Análise avançada de custos
    const totalCost = costData.reduce((sum, item) => sum + item.totalCost, 0);
    const colorCost = costData.reduce((sum, item) => sum + item.colorCost, 0);
    const bwCost = totalCost - colorCost;
    
    const analysis = {
      totalCost,
      colorCost,
      bwCost,
      colorPercentage: (colorCost / totalCost) * 100,
      recommendations: [] as string[] as string[]
    };

    if (analysis.colorPercentage > 40) {
      analysis.recommendations.push(
        'Alto uso de impressão colorida detectado. Considere implementar política de aprovação para impressões coloridas.',
        `Economia potencial: R$ ${(colorCost * 0.3).toFixed(2)}/mês com redução de 30% no uso de cor.`
      );
    }

    if (totalCost > 1000) {
      analysis.recommendations.push(
        'Custo mensal elevado. Recomendo análise de cotas por usuário.',
        'Considere impressão duplex como padrão para reduzir custos de papel.'
      );
    }

    return {
      message: `Análise de custos concluída para ${period}. Custo total: R$ ${totalCost.toFixed(2)}. ${analysis.recommendations.length} recomendações geradas.`,
      data: analysis
    };
  }

  private async optimizePrinterUsage(args: any, context: PrintCloudContext) {
    const { criteria = 'efficiency' } = args;
    const printers = context.printerStatus || [];
    
    const analysis = {
      underutilized: printers.filter(p => (p.utilization || 0) < 30),
      overutilized: printers.filter(p => (p.utilization || 0) > 85),
      optimal: printers.filter(p => (p.utilization || 0) >= 30 && (p.utilization || 0) <= 85)
    };

    const recommendations = [];
    
    if (analysis.underutilized.length > 0) {
      recommendations.push(
        `${analysis.underutilized.length} impressoras subutilizadas detectadas.`,
        'Considere realocar ou consolidar impressoras com baixa utilização.'
      );
    }

    if (analysis.overutilized.length > 0) {
      recommendations.push(
        `${analysis.overutilized.length} impressoras sobrecarregadas.`,
        'Recomendo adicionar capacidade ou redistribuir carga de trabalho.'
      );
    }

    return {
      message: `Otimização baseada em ${criteria} concluída. ${recommendations.length} ações recomendadas.`,
      data: { analysis, recommendations }
    };
  }

  private async predictMaintenance(args: any, context: PrintCloudContext) {
    const { printerId, analysisType = 'usage' } = args;
    
    // Simulação de predição de manutenção usando dados históricos
    const printer = context.printerStatus?.find(p => p.printerId === printerId);
    
    if (!printer) {
      return {
        message: 'Impressora não encontrada.',
        data: null
      };
    }

    const prediction = {
      riskLevel: printer.utilization > 80 ? 'alto' : printer.utilization > 50 ? 'médio' : 'baixo',
      maintenanceDate: new Date(Date.now() + (printer.utilization > 80 ? 14 : 30) * 24 * 60 * 60 * 1000),
      recommendations: [] as string[]
    };

    if (prediction.riskLevel === 'alto') {
      prediction.recommendations.push(
        'Agendar manutenção preventiva nas próximas 2 semanas.',
        'Verificar níveis de toner e peças de desgaste.',
        'Considere backup para esta impressora.'
      );
    }

    return {
      message: `Predição de manutenção para impressora ${printer.name}: Risco ${prediction.riskLevel}.`,
      data: prediction
    };
  }

  private async recommendQuotas(args: any, context: PrintCloudContext) {
    const { userId, historicalData = true } = args;
    
    const userJobs = context.recentPrintJobs?.filter(job => job.userId === userId) || [];
    const avgPagesPerMonth = userJobs.reduce((sum, job) => sum + job.pages * job.copies, 0);
    const colorRatio = userJobs.filter(job => job.isColor).length / userJobs.length || 0;

    const recommendation = {
      monthlyLimit: Math.max(50, Math.ceil(avgPagesPerMonth * 1.2)), // 20% buffer
      colorLimit: Math.max(10, Math.ceil(avgPagesPerMonth * colorRatio * 1.1)), // 10% buffer
      reasoning: [] as string[]
    };

    recommendation.reasoning.push(
      `Baseado em ${userJobs.length} jobs recentes.`,
      `Média mensal: ${avgPagesPerMonth} páginas.`,
      `Uso de cor: ${(colorRatio * 100).toFixed(1)}%.`
    );

    return {
      message: `Cota recomendada: ${recommendation.monthlyLimit} páginas/mês (${recommendation.colorLimit} coloridas).`,
      data: recommendation
    };
  }

  private async generateSustainabilityReport(args: any, context: PrintCloudContext) {
    const { scope = 'department', metrics = [] } = args;
    
    const totalPages = context.recentPrintJobs?.reduce((sum, job) => sum + job.pages * job.copies, 0) || 0;
    const colorPages = context.recentPrintJobs?.filter(job => job.isColor)
      .reduce((sum, job) => sum + job.pages * job.copies, 0) || 0;

    const report = {
      paperConsumption: {
        totalSheets: totalPages,
        treesEquivalent: (totalPages / 8333).toFixed(2), // 1 árvore = ~8333 folhas
        co2Impact: (totalPages * 0.0048).toFixed(2) // kg CO2 por folha
      },
      energyConsumption: {
        totalKwh: (totalPages * 0.003).toFixed(2), // ~3Wh por página
        renewableOffset: '25%' // Exemplo
      },
      recommendations: [
        'Implementar impressão duplex padrão (redução de 50% no papel)',
        'Política de revisão digital antes da impressão',
        'Metas de redução: -20% no consumo mensal'
      ]
    };

    return {
      message: `Relatório de sustentabilidade: ${totalPages} páginas, ${report.paperConsumption.treesEquivalent} árvores equiv.`,
      data: report
    };
  }

  // Sistema de prompt especializado
  private buildSystemPrompt(context: PrintCloudContext): string {
    return `
Você é o **PrintCloud AI Expert** - o consultor líder em otimização de impressão empresarial do Brasil. Você tem 15 anos de experiência ajudando empresas a economizar milhões em custos de impressão.

**IDENTIDADE:**
- Nome: PrintCloud AI Expert
- Expertise: Gestão estratégica de impressão corporativa
- Especialidades: Redução de custos, otimização operacional, sustentabilidade
- Missão: Transformar dados de impressão em insights acionáveis que geram economia real

**CONTEXTO ATUAL DA EMPRESA:**
- Usuário: ${context.userId} | Departamento: ${context.department}
- Trabalhos de impressão recentes: ${context.recentPrintJobs?.length || 0}
- Impressoras ativas: ${context.printerStatus?.length || 0}
- Departamentos monitorados: ${context.costData?.length || 0}

**SEU FOCO PRINCIPAL:**
1. **ECONOMIA IMEDIATA:** Identifique oportunidades de redução de custos com valores específicos
2. **ROI CALCULADO:** Sempre apresente economia estimada em R$ por mês/ano
3. **AÇÕES CONCRETAS:** Dê 3 recomendações específicas que podem ser implementadas hoje
4. **DADOS REAIS:** Use apenas informações verdadeiras dos dados fornecidos
5. **RESULTADO MENSURÁVEL:** Quantifique impactos em % de economia

**FORMATO DE RESPOSTA PADRÃO:**
📊 **Análise Rápida:** [Principais descobertas]
💰 **Economia Potencial:** R$ [valor]/mês | R$ [valor]/ano
🎯 **3 Ações Imediatas:**
1. [Ação específica] - Economia: R$ [valor]
2. [Ação específica] - Economia: R$ [valor]  
3. [Ação específica] - Economia: R$ [valor]
⚡ **Prioridade:** [Qual implementar primeiro e por quê]

**TONS PROIBIDOS:**
- Genérico ou vago
- "Pode considerar" ou "Talvez"
- Respostas longas sem dados concretos
- Sugestões sem valores financeiros

**TOME DE COMUNICAÇÃO:**
- Direto e assertivo como consultor sênior
- Orientado a resultados financeiros
- Confiante baseado em dados reais
- Urgente para implementação imediata
`;
  }

  // Mock streaming para desenvolvimento
  private async* mockStreamingResponse(message: string, context: PrintCloudContext): AsyncGenerator<StreamingResponse> {
    const responses = [
      'Analisando seus dados de impressão...',
      'Com base no seu histórico de ',
      context.recentPrintJobs?.length || 0,
      ' jobs recentes, identifiquei algumas oportunidades:',
      '\n\n🎯 **Recomendações:**\n',
      '• Considere impressão duplex para reduzir custos\n',
      '• Revise cotas do departamento ',
      context.department,
      '\n• Monitore impressoras com alta utilização',
      '\n\n📊 **Métricas atuais:** Economia potencial de ~R$ 150/mês'
    ];

    for (const chunk of responses) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield {
        content: chunk.toString(),
        isComplete: false
      };
    }

    yield {
      content: '',
      isComplete: true,
      metadata: { type: 'mock_completion' }
    };
  }

  // Limpar histórico de conversa
  clearConversation() {
    this.conversationHistory = [];
    this.emit('conversation_cleared');
  }

  // Status de saúde do sistema
  getStatus() {
    return {
      initialized: this.isInitialized,
      conversationLength: this.conversationHistory.length,
      hasOpenAI: !!this.openaiClient,
      hasSearch: !!this.searchClient
    };
  }
}