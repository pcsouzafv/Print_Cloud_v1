import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DatabaseTrainingData {
  users: any[];
  printers: any[];
  printJobs: any[];
  departments: any[];
  quotas: any[];
  costs: any[];
  statusHistory: any[];
  patterns: any;
  insights: any;
}

export class DatabaseTrainingService {
  private static instance: DatabaseTrainingService;
  
  public static getInstance(): DatabaseTrainingService {
    if (!DatabaseTrainingService.instance) {
      DatabaseTrainingService.instance = new DatabaseTrainingService();
    }
    return DatabaseTrainingService.instance;
  }

  // Buscar dados completos para treinamento da IA
  async getTrainingData(filters?: {
    department?: string;
    userId?: string;
    timeRange?: { from: Date; to: Date };
    includePatterns?: boolean;
  }): Promise<DatabaseTrainingData> {
    const timeFilter = filters?.timeRange ? {
      gte: filters.timeRange.from,
      lte: filters.timeRange.to
    } : {
      gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Últimos 90 dias
    };

    try {
      // 1. BUSCAR DADOS DE USUÁRIOS
      const users = await prisma.user.findMany({
        where: filters?.department ? { department: filters.department } : undefined,
        include: {
          printJobs: {
            where: { submittedAt: timeFilter },
            include: {
              printer: true
            }
          },
          printQuotas: true,
          _count: {
            select: {
              printJobs: true,
              auditLogs: true
            }
          }
        },
        take: 1000
      });

      // 2. BUSCAR DADOS DE IMPRESSORAS
      const printers = await prisma.printer.findMany({
        where: filters?.department ? { department: filters.department } : undefined,
        include: {
          printJobs: {
            where: { submittedAt: timeFilter },
            include: {
              user: true
            }
          },
          statusHistory: {
            where: { timestamp: timeFilter },
            orderBy: { timestamp: 'desc' },
            take: 100
          },
          _count: {
            select: {
              printJobs: true,
              capturedJobs: true
            }
          }
        }
      });

      // 3. BUSCAR TRABALHOS DE IMPRESSÃO
      const printJobs = await prisma.printJob.findMany({
        where: {
          submittedAt: timeFilter,
          ...(filters?.userId && { userId: filters.userId }),
          ...(filters?.department && { user: { department: filters.department } })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              department: true,
              role: true
            }
          },
          printer: {
            select: {
              id: true,
              name: true,
              location: true,
              department: true,
              isColorPrinter: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: 5000
      });

      // 4. BUSCAR DEPARTAMENTOS
      const departments = await prisma.department.findMany({
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              managedDepartments: true
            }
          }
        }
      });

      // 5. BUSCAR COTAS
      const quotas = await prisma.printQuota.findMany({
        where: filters?.userId ? { userId: filters.userId } : undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              department: true
            }
          }
        }
      });

      // 6. BUSCAR CUSTOS
      const costs = await prisma.printCost.findMany();

      // 7. BUSCAR HISTÓRICO DE STATUS
      const statusHistory = await prisma.printerStatusHistory.findMany({
        where: { timestamp: timeFilter },
        include: {
          printer: {
            select: {
              id: true,
              name: true,
              department: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 1000
      });

      // 8. GERAR PADRÕES E INSIGHTS (se solicitado)
      let patterns = {};
      let insights = {};

      if (filters?.includePatterns !== false) {
        patterns = await this.generatePatterns(printJobs, users, printers);
        insights = await this.generateInsights(printJobs, users, printers, departments);
      }

      return {
        users: users.map(this.sanitizeUser),
        printers: printers.map(this.sanitizePrinter),
        printJobs: printJobs.map(this.sanitizePrintJob),
        departments,
        quotas,
        costs,
        statusHistory,
        patterns,
        insights
      };

    } catch (error) {
      console.error('Erro ao buscar dados para treinamento:', error);
      throw new Error('Falha ao buscar dados do banco para treinamento da IA');
    }
  }

  // Gerar padrões de uso para treinamento
  private async generatePatterns(printJobs: any[], users: any[], printers: any[]) {
    return {
      // Padrões por departamento
      departmentPatterns: this.analyzeByDepartment(printJobs, users),
      
      // Padrões por usuário
      userPatterns: this.analyzeByUser(printJobs, users),
      
      // Padrões por impressora
      printerPatterns: this.analyzeByPrinter(printJobs, printers),
      
      // Padrões temporais
      timePatterns: this.analyzeTimePatterns(printJobs),
      
      // Padrões de custo
      costPatterns: this.analyzeCostPatterns(printJobs),
      
      // Padrões de desperdício
      wastePatterns: this.analyzeWastePatterns(printJobs, users)
    };
  }

  // Gerar insights inteligentes
  private async generateInsights(printJobs: any[], users: any[], printers: any[], departments: any[]) {
    const totalJobs = printJobs.length;
    const totalPages = printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
    const totalCost = printJobs.reduce((sum, job) => sum + job.cost, 0);
    const colorJobs = printJobs.filter(job => job.isColor).length;

    return {
      summary: {
        totalJobs,
        totalPages,
        totalCost,
        colorPercentage: (colorJobs / totalJobs) * 100,
        avgPagesPerJob: totalPages / totalJobs,
        avgCostPerJob: totalCost / totalJobs
      },
      
      topUsers: users
        .map(user => ({
          ...user,
          totalJobs: user.printJobs?.length || 0,
          totalPages: user.printJobs?.reduce((sum: number, job: any) => sum + (job.pages * job.copies), 0) || 0,
          totalCost: user.printJobs?.reduce((sum: number, job: any) => sum + job.cost, 0) || 0
        }))
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 10),
      
      printerUtilization: printers.map(printer => ({
        id: printer.id,
        name: printer.name,
        department: printer.department,
        jobCount: printer.printJobs?.length || 0,
        utilization: this.calculatePrinterUtilization(printer),
        efficiency: this.calculatePrinterEfficiency(printer)
      })),
      
      departmentAnalysis: departments.map(dept => {
        const deptJobs = printJobs.filter(job => job.user.department === dept.name);
        const deptCost = deptJobs.reduce((sum, job) => sum + job.cost, 0);
        return {
          name: dept.name,
          budget: dept.budget,
          spent: deptCost,
          utilizationRate: (deptCost / dept.budget) * 100,
          jobCount: deptJobs.length,
          avgJobCost: deptCost / deptJobs.length
        };
      }),
      
      anomalies: this.detectAnomalies(printJobs, users),
      
      recommendations: this.generateRecommendations(printJobs, users, printers, departments)
    };
  }

  // Análises específicas
  private analyzeByDepartment(printJobs: any[], users: any[]) {
    const deptStats: { [key: string]: any } = {};
    
    printJobs.forEach(job => {
      const dept = job.user.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          totalJobs: 0,
          totalPages: 0,
          totalCost: 0,
          colorJobs: 0,
          users: new Set()
        };
      }
      
      deptStats[dept].totalJobs++;
      deptStats[dept].totalPages += (job.pages * job.copies);
      deptStats[dept].totalCost += job.cost;
      if (job.isColor) deptStats[dept].colorJobs++;
      deptStats[dept].users.add(job.userId);
    });
    
    return Object.entries(deptStats).map(([dept, stats]: [string, any]) => ({
      department: dept,
      totalJobs: stats.totalJobs,
      totalPages: stats.totalPages,
      totalCost: stats.totalCost,
      colorPercentage: (stats.colorJobs / stats.totalJobs) * 100,
      avgCostPerJob: stats.totalCost / stats.totalJobs,
      activeUsers: stats.users.size
    }));
  }

  private analyzeByUser(printJobs: any[], users: any[]) {
    return users.map(user => {
      const userJobs = printJobs.filter(job => job.userId === user.id);
      const totalCost = userJobs.reduce((sum, job) => sum + job.cost, 0);
      const totalPages = userJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
      
      return {
        userId: user.id,
        name: user.name,
        department: user.department,
        totalJobs: userJobs.length,
        totalPages,
        totalCost,
        avgJobSize: totalPages / userJobs.length || 0,
        colorUsage: userJobs.filter(job => job.isColor).length / userJobs.length * 100 || 0
      };
    });
  }

  private analyzeTimePatterns(printJobs: any[]) {
    const hourlyStats: { [key: number]: number } = {};
    const dailyStats: { [key: number]: number } = {};
    const monthlyStats: { [key: number]: number } = {};

    printJobs.forEach(job => {
      const date = new Date(job.submittedAt);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const month = date.getMonth();

      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      dailyStats[dayOfWeek] = (dailyStats[dayOfWeek] || 0) + 1;
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    return {
      peakHours: Object.entries(hourlyStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: parseInt(hour), jobs: count })),
      
      peakDays: Object.entries(dailyStats)
        .sort(([,a], [,b]) => b - a)
        .map(([day, count]) => ({ 
          day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][parseInt(day)], 
          jobs: count 
        })),
      
      monthlyTrend: Object.entries(monthlyStats)
        .map(([month, count]) => ({ 
          month: parseInt(month) + 1, 
          jobs: count 
        }))
    };
  }

  private analyzeCostPatterns(printJobs: any[]) {
    const costs = printJobs.map(job => job.cost).sort((a, b) => a - b);
    const totalCost = costs.reduce((sum, cost) => sum + cost, 0);
    
    return {
      totalCost,
      avgCost: totalCost / costs.length,
      medianCost: costs[Math.floor(costs.length / 2)],
      minCost: costs[0],
      maxCost: costs[costs.length - 1],
      expensiveJobs: printJobs
        .filter(job => job.cost > totalCost / costs.length * 2)
        .map(job => ({
          id: job.id,
          user: job.user.name,
          cost: job.cost,
          pages: job.pages,
          copies: job.copies,
          isColor: job.isColor
        }))
    };
  }

  private analyzeWastePatterns(printJobs: any[], users: any[]) {
    const wasteIndicators = [];
    
    // Detectar impressões grandes desnecessárias
    const largeJobs = printJobs.filter(job => (job.pages * job.copies) > 50);
    if (largeJobs.length > 0) {
      wasteIndicators.push({
        type: 'large_jobs',
        count: largeJobs.length,
        impact: largeJobs.reduce((sum, job) => sum + job.cost, 0),
        description: 'Trabalhos de impressão muito grandes detectados'
      });
    }
    
    // Detectar uso excessivo de cor
    const colorJobs = printJobs.filter(job => job.isColor);
    const colorPercentage = (colorJobs.length / printJobs.length) * 100;
    if (colorPercentage > 30) {
      wasteIndicators.push({
        type: 'excessive_color',
        percentage: colorPercentage,
        impact: colorJobs.reduce((sum, job) => sum + (job.cost * 0.7), 0), // Economia estimada
        description: 'Uso excessivo de impressão colorida'
      });
    }
    
    return wasteIndicators;
  }

  // Detectar anomalias
  private detectAnomalies(printJobs: any[], users: any[]) {
    const anomalies = [];
    
    // Usuários com uso muito acima da média
    const avgJobsPerUser = printJobs.length / users.length;
    users.forEach(user => {
      const userJobCount = user.printJobs?.length || 0;
      if (userJobCount > avgJobsPerUser * 3) {
        anomalies.push({
          type: 'high_usage_user',
          userId: user.id,
          userName: user.name,
          jobCount: userJobCount,
          threshold: avgJobsPerUser * 3
        });
      }
    });
    
    return anomalies;
  }

  // Gerar recomendações inteligentes
  private generateRecommendations(printJobs: any[], users: any[], printers: any[], departments: any[]) {
    const recommendations = [];
    
    // Recomendação de economia com duplex
    const singleSidedJobs = printJobs.filter(job => job.pages > 1);
    if (singleSidedJobs.length > 0) {
      const potentialSavings = singleSidedJobs.reduce((sum, job) => sum + (job.cost * 0.3), 0);
      recommendations.push({
        type: 'duplex_printing',
        priority: 'high',
        impact: potentialSavings,
        description: 'Implementar impressão duplex como padrão',
        implementation: 'Configurar duplex automático em todas as impressoras'
      });
    }
    
    return recommendations;
  }

  // Utilitários de cálculo
  private calculatePrinterUtilization(printer: any): number {
    const maxJobsPerMonth = 1000; // Assumindo capacidade
    const currentJobs = printer.printJobs?.length || 0;
    return Math.min((currentJobs / maxJobsPerMonth) * 100, 100);
  }

  private calculatePrinterEfficiency(printer: any): number {
    const completedJobs = printer.printJobs?.filter((job: any) => job.status === 'COMPLETED').length || 0;
    const totalJobs = printer.printJobs?.length || 0;
    return totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 100;
  }

  // Sanitização de dados sensíveis
  private sanitizeUser(user: any) {
    const { email, azureId, ...sanitized } = user;
    return {
      ...sanitized,
      email: email ? email.replace(/(.{2}).*@/, '$1***@') : null
    };
  }

  private sanitizePrinter(printer: any) {
    const { ipAddress, serialNumber, ...sanitized } = printer;
    return {
      ...sanitized,
      ipAddress: ipAddress ? ipAddress.replace(/\d+$/, 'xxx') : null,
      serialNumber: serialNumber ? serialNumber.substring(0, 4) + '***' : null
    };
  }

  private sanitizePrintJob(job: any) {
    const { fileName, ...sanitized } = job;
    return {
      ...sanitized,
      fileName: fileName ? fileName.replace(/(.{10}).*/, '$1...') : null
    };
  }

  // Busca específica para contexto da IA
  async getContextForAI(userId?: string, department?: string): Promise<any> {
    const timeRange = {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      to: new Date()
    };

    const trainingData = await this.getTrainingData({
      userId,
      department,
      timeRange,
      includePatterns: true
    });

    // Formatação otimizada para o contexto da IA
    return {
      summary: trainingData.insights,
      recentActivity: trainingData.printJobs.slice(0, 50),
      userProfiles: trainingData.users.slice(0, 20),
      printerStatus: trainingData.printers,
      patterns: trainingData.patterns,
      recommendations: trainingData.insights.recommendations
    };
  }
}

export default DatabaseTrainingService;