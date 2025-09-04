import { AzureOpenAI } from 'openai/azure';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local', override: true });
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { BlobServiceClient } from '@azure/storage-blob';
import { prisma } from '../src/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

/**
 * Script de treinamento do modelo IA especializado para Print Cloud
 * Cria embeddings e treina o modelo com dados específicos de impressão
 */

interface TrainingData {
  id: string;
  type: 'print_optimization' | 'cost_analysis' | 'maintenance_prediction' | 'user_behavior' | 'sustainability';
  content: string;
  metadata: any;
  embedding?: number[];
}

class PrintCloudAITrainer {
  private openaiClient!: AzureOpenAI;
  private searchClient!: SearchClient<any>;
  private blobClient!: BlobServiceClient;
  private trainingData: TrainingData[] = [];

  constructor() {
    this.setupClients();
  }

  private setupClients() {
    console.log('🔧 Configurando clientes Azure...');

    // Azure OpenAI
    if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
      throw new Error('Azure OpenAI credentials missing');
    }

    this.openaiClient = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_KEY,
      apiVersion: '2024-03-01-preview'
    });

    // Azure Cognitive Search
    if (process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY) {
      this.searchClient = new SearchClient(
        process.env.AZURE_SEARCH_ENDPOINT,
        'printcloud-knowledge',
        new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
      );
    }

    // Blob Storage
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      this.blobClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      );
    }
  }

  // 1. Coletar dados de treinamento do banco de dados
  async collectTrainingData(): Promise<void> {
    console.log('📊 Coletando dados de treinamento do banco...');

    try {
      // Dados de jobs de impressão para análise de padrões
      const printJobs = await prisma.printJob.findMany({
        include: {
          user: { select: { department: true, name: true } },
          printer: { select: { name: true, location: true, isColorPrinter: true } }
        },
        take: 1000,
        orderBy: { submittedAt: 'desc' }
      });

      // Dados de usuários para análise de comportamento
      const users = await prisma.user.findMany({
        include: {
          printJobs: { take: 50 },
          printQuotas: true
        }
      });

      // Dados de impressoras para análise de performance
      const printers = await prisma.printer.findMany({
        include: {
          printJobs: { take: 100 }
        }
      });

      // Converter para dados de treinamento
      this.processPrintData(printJobs);
      this.processUserData(users);
      this.processPrinterData(printers);

      // Adicionar conhecimento especializado
      await this.addDomainKnowledge();

      console.log(`✅ Coletados ${this.trainingData.length} registros de treinamento`);

    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      // Fallback para dados simulados
      await this.generateMockTrainingData();
    }
  }

  private processPrintData(printJobs: any[]) {
    printJobs.forEach(job => {
      // Análise de custos
      this.trainingData.push({
        id: `cost-analysis-${job.id}`,
        type: 'cost_analysis',
        content: `Job de impressão: ${job.fileName}, ${job.pages} páginas, ${job.copies} cópias, ${job.isColor ? 'colorido' : 'preto e branco'}, custo R$ ${job.cost.toFixed(2)}, departamento ${job.user?.department}, impressora ${job.printer?.name}`,
        metadata: {
          pages: job.pages,
          copies: job.copies,
          isColor: job.isColor,
          cost: job.cost,
          department: job.user?.department,
          printerType: job.printer?.isColorPrinter ? 'color' : 'bw'
        }
      });

      // Padrões de otimização
      if (job.cost > 5) {
        this.trainingData.push({
          id: `optimization-${job.id}`,
          type: 'print_optimization',
          content: `Job de alto custo detectado: ${job.fileName} custou R$ ${job.cost.toFixed(2)} com ${job.pages * job.copies} páginas totais. ${job.isColor ? 'Considerar política de aprovação para cor.' : 'Volume alto sugere necessidade de cotas.'} Departamento: ${job.user?.department}`,
          metadata: {
            optimizationType: job.isColor ? 'color_policy' : 'volume_control',
            costImpact: 'high',
            department: job.user?.department
          }
        });
      }
    });
  }

  private processUserData(users: any[]) {
    users.forEach(user => {
      const totalJobs = user.printJobs?.length || 0;
      const totalCost = user.printJobs?.reduce((sum: number, job: any) => sum + job.cost, 0) || 0;
      const colorJobs = user.printJobs?.filter((job: any) => job.isColor).length || 0;

      this.trainingData.push({
        id: `user-behavior-${user.id}`,
        type: 'user_behavior',
        content: `Usuário ${user.name} do departamento ${user.department}: ${totalJobs} jobs, custo total R$ ${totalCost.toFixed(2)}, ${colorJobs} impressões coloridas. ${totalCost > 100 ? 'Usuário de alto volume' : 'Usuário padrão'}. ${colorJobs / totalJobs > 0.3 ? 'Alto uso de cor' : 'Uso moderado de cor'}.`,
        metadata: {
          totalJobs,
          totalCost,
          colorRatio: totalJobs > 0 ? colorJobs / totalJobs : 0,
          department: user.department,
          userType: totalCost > 100 ? 'high_volume' : 'standard'
        }
      });

      // Recomendações de cota
      const recommendedQuota = Math.max(50, Math.ceil(totalJobs * 1.2));
      this.trainingData.push({
        id: `quota-recommendation-${user.id}`,
        type: 'user_behavior',
        content: `Para usuário ${user.name} (${user.department}), baseado em ${totalJobs} jobs recentes, recomenda-se cota de ${recommendedQuota} páginas mensais com ${Math.ceil(colorJobs * 1.1)} páginas coloridas.`,
        metadata: {
          recommendedQuota,
          colorQuota: Math.ceil(colorJobs * 1.1),
          basedOnJobs: totalJobs
        }
      });
    });
  }

  private processPrinterData(printers: any[]) {
    printers.forEach(printer => {
      const recentJobs = printer.printJobs || [];
      const utilization = (recentJobs.length / 1000) * 100; // Assumindo capacidade de 1000 jobs/mês
      const avgJobSize = recentJobs.length > 0 
        ? recentJobs.reduce((sum: number, job: any) => sum + job.pages * job.copies, 0) / recentJobs.length 
        : 0;

      this.trainingData.push({
        id: `printer-analysis-${printer.id}`,
        type: 'maintenance_prediction',
        content: `Impressora ${printer.name} (${printer.location}): ${utilization.toFixed(1)}% utilização, ${recentJobs.length} jobs recentes, média de ${avgJobSize.toFixed(1)} páginas por job. ${utilization > 80 ? 'Sobrecarga detectada - manutenção em 2 semanas' : utilization < 30 ? 'Subutilizada - considerar realocação' : 'Utilização ideal'}.`,
        metadata: {
          utilization,
          avgJobSize,
          status: utilization > 80 ? 'overloaded' : utilization < 30 ? 'underutilized' : 'optimal',
          location: printer.location,
          isColor: printer.isColorPrinter
        }
      });
    });
  }

  private async addDomainKnowledge() {
    console.log('📚 Adicionando conhecimento de domínio...');

    // Conhecimento sobre custos de impressão
    this.trainingData.push({
      id: 'knowledge-printing-costs',
      type: 'cost_analysis',
      content: 'Custos típicos de impressão: página P&B R$ 0,05-0,08, página colorida R$ 0,15-0,25. Impressão duplex reduz custo de papel em 50%. Toner representa 60-70% do custo operacional. Manutenção preventiva reduz custos em 30%.',
      metadata: { type: 'cost_knowledge' }
    });

    // Conhecimento sobre sustentabilidade
    this.trainingData.push({
      id: 'knowledge-sustainability',
      type: 'sustainability',
      content: 'Impacto ambiental: 1 árvore = 8.333 folhas de papel. 1 folha = 4,8g CO2. Impressão duplex reduz uso de papel em 50%. Modo econômico de toner reduz consumo em 20%. Reciclagem de cartuchos evita 2,5kg CO2 por unidade.',
      metadata: { type: 'sustainability_knowledge' }
    });

    // Conhecimento sobre otimização
    this.trainingData.push({
      id: 'knowledge-optimization',
      type: 'print_optimization',
      content: 'Melhores práticas: configurar duplex como padrão, implementar cotas por usuário/departamento, política de aprovação para impressão colorida, consolidar impressoras subutilizadas, balancear carga entre equipamentos.',
      metadata: { type: 'optimization_knowledge' }
    });

    // Conhecimento sobre manutenção
    this.trainingData.push({
      id: 'knowledge-maintenance',
      type: 'maintenance_prediction',
      content: 'Sinais de manutenção necessária: utilização > 85%, aumento de falhas, qualidade de impressão deteriorada, consumo excessivo de toner. Manutenção preventiva a cada 10.000 páginas ou 3 meses.',
      metadata: { type: 'maintenance_knowledge' }
    });
  }

  // 2. Gerar embeddings para os dados
  async generateEmbeddings(): Promise<void> {
    console.log('🧠 Gerando embeddings...');

    const batchSize = 10;
    let processed = 0;

    for (let i = 0; i < this.trainingData.length; i += batchSize) {
      const batch = this.trainingData.slice(i, i + batchSize);
      
      try {
        const embeddings = await Promise.all(
          batch.map(async (item) => {
            const response = await this.openaiClient.embeddings.create({
              model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
              input: item.content
            });
            return response.data[0].embedding;
          })
        );

        // Adicionar embeddings aos dados
        batch.forEach((item, index) => {
          item.embedding = embeddings[index];
        });

        processed += batch.length;
        console.log(`   Processados ${processed}/${this.trainingData.length} registros...`);

        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Erro ao processar batch ${i}-${i + batchSize}:`, error);
        // Continuar com próximo batch
      }
    }

    console.log('✅ Embeddings gerados com sucesso!');
  }

  // 3. Carregar dados para Azure Cognitive Search
  async uploadToSearch(): Promise<void> {
    if (!this.searchClient) {
      console.log('⚠️ Azure Search não configurado, pulando upload...');
      return;
    }

    console.log('🔍 Carregando dados para Azure Cognitive Search...');

    try {
      // Preparar documentos para indexação
      const documents = this.trainingData
        .filter(item => item.embedding)
        .map(item => ({
          id: item.id,
          type: item.type,
          content: item.content,
          metadata: JSON.stringify(item.metadata),
          createdAt: new Date().toISOString()
        }));

      // Upload em batches
      const batchSize = 100;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await this.searchClient.uploadDocuments(batch);
        console.log(`   Carregados ${Math.min(i + batchSize, documents.length)}/${documents.length} documentos...`);
      }

      console.log('✅ Dados carregados para Azure Search!');

    } catch (error) {
      console.error('Erro ao carregar para Search:', error);
    }
  }

  // 4. Salvar dados de treinamento localmente
  async saveTrainingData(): Promise<void> {
    console.log('💾 Salvando dados de treinamento...');

    const dataDir = path.join(process.cwd(), 'data', 'training');
    await fs.mkdir(dataDir, { recursive: true });

    // Salvar dados completos
    const fullDataPath = path.join(dataDir, `printcloud-training-${Date.now()}.json`);
    await fs.writeFile(fullDataPath, JSON.stringify(this.trainingData, null, 2));

    // Salvar apenas conteúdo para fine-tuning
    const fineTuningData = this.trainingData.map(item => ({
      messages: [
        { role: 'system', content: 'Você é um especialista em otimização de sistemas de impressão corporativa.' },
        { role: 'user', content: `Analise: ${item.content}` },
        { role: 'assistant', content: this.generateResponse(item) }
      ]
    }));

    const fineTuningPath = path.join(dataDir, `printcloud-finetune-${Date.now()}.jsonl`);
    const fineTuningContent = fineTuningData.map(item => JSON.stringify(item)).join('\n');
    await fs.writeFile(fineTuningPath, fineTuningContent);

    console.log(`✅ Dados salvos em:`);
    console.log(`   - Completos: ${fullDataPath}`);
    console.log(`   - Fine-tuning: ${fineTuningPath}`);
  }

  private generateResponse(item: TrainingData): string {
    switch (item.type) {
      case 'cost_analysis':
        return `Com base nos dados apresentados, identifiquei oportunidades de otimização de custos. ${item.metadata.isColor ? 'A impressão colorida representa um custo significativo - considere política de aprovação.' : 'O volume sugere necessidade de monitoramento de cotas.'} Recomendo análise departamental para otimização.`;
      
      case 'print_optimization':
        return `Para otimizar este cenário, sugiro: ${item.metadata.optimizationType === 'color_policy' ? 'implementar aprovação para impressões coloridas, configurar driver para P&B por padrão' : 'estabelecer cotas mensais, configurar duplex automático'}. Impacto estimado: economia de 20-30%.`;
      
      case 'maintenance_prediction':
        return `Baseado nos padrões de uso, ${item.metadata.status === 'overloaded' ? 'recomendo manutenção preventiva imediata e balanceamento de carga' : item.metadata.status === 'underutilized' ? 'sugiro realocação ou consolidação deste equipamento' : 'o equipamento está em condições ideais, manutenção de rotina suficiente'}.`;
      
      case 'user_behavior':
        return `Para este perfil de usuário, recomendo: ${item.metadata.userType === 'high_volume' ? 'cota personalizada e monitoramento mensal' : 'cota padrão com revisão trimestral'}. ${item.metadata.colorRatio > 0.3 ? 'Implementar controle de impressão colorida.' : 'Padrão de uso aceitável.'}`;
      
      case 'sustainability':
        return `O impacto ambiental pode ser reduzido através de: impressão duplex (reduz papel em 50%), modo econômico (reduz toner em 20%), e revisão digital antes da impressão. Estas medidas podem reduzir a pegada de carbono em até 40%.`;
      
      default:
        return `Análise concluída. Dados processados para otimização do sistema de impressão.`;
    }
  }

  // Gerar dados mock para desenvolvimento
  private async generateMockTrainingData(): Promise<void> {
    console.log('🔧 Gerando dados de treinamento simulados...');

    const mockData: TrainingData[] = [
      {
        id: 'mock-cost-1',
        type: 'cost_analysis',
        content: 'Departamento Marketing: 1250 páginas, R$ 187,50 total, 35% coloridas. Alto uso de cor detectado.',
        metadata: { department: 'Marketing', pages: 1250, cost: 187.50, colorRatio: 0.35 }
      },
      {
        id: 'mock-optimization-1',
        type: 'print_optimization',
        content: 'Impressora HP LaserJet sobregregada com 95% utilização. Necessita balanceamento de carga.',
        metadata: { printer: 'HP LaserJet', utilization: 95, action: 'load_balance' }
      },
      {
        id: 'mock-maintenance-1',
        type: 'maintenance_prediction',
        content: 'Canon ImageRunner com 85% utilização e 12.000 páginas impressas. Manutenção em 2 semanas.',
        metadata: { printer: 'Canon ImageRunner', utilization: 85, pages: 12000, maintenance: '2weeks' }
      }
    ];

    this.trainingData = mockData;
    console.log(`✅ ${mockData.length} registros simulados criados`);
  }

  // Executar treinamento completo
  async trainModel(): Promise<void> {
    console.log('🚀 Iniciando treinamento do modelo Print Cloud AI...\n');

    const startTime = Date.now();

    try {
      // 1. Coletar dados
      await this.collectTrainingData();
      
      // 2. Gerar embeddings
      await this.generateEmbeddings();
      
      // 3. Upload para Azure Search
      await this.uploadToSearch();
      
      // 4. Salvar dados localmente
      await this.saveTrainingData();

      const duration = (Date.now() - startTime) / 1000;
      
      console.log('\n🎉 Treinamento concluído com sucesso!');
      console.log(`⏱️  Tempo total: ${duration.toFixed(1)}s`);
      console.log(`📊 Dados processados: ${this.trainingData.length} registros`);
      console.log(`🧠 Embeddings gerados: ${this.trainingData.filter(d => d.embedding).length}`);

    } catch (error) {
      console.error('❌ Erro durante treinamento:', error);
      throw error;
    }
  }
}

// Executar treinamento se chamado diretamente
if (require.main === module) {
  const trainer = new PrintCloudAITrainer();
  trainer.trainModel()
    .then(() => {
      console.log('✅ Treinamento finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha no treinamento:', error);
      process.exit(1);
    });
}

export { PrintCloudAITrainer };