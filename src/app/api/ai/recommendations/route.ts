import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIRecommendations, isAzureAIConfigured, generateCostOptimizationReport, analyzePrintJobSentiment } from '@/lib/azure-ai-simple';
import { getMockRecommendations } from '@/lib/mock-ai';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'general'; // general, cost, sustainability, efficiency

    // Gather data for recommendations
    const [userUsage, printerStatus, costData] = await Promise.all([
      getUserUsageData(department, userId),
      getPrinterStatusData(department),
      getCostAnalysisData(department, userId),
    ]);

    // Enhanced AI recommendations with comprehensive analysis
    let recommendations, specificRecommendations, potentialSavings, costOptimizationReport, sentimentAnalysis;
    
    if (isAzureAIConfigured() && userUsage.length > 0) {
      try {
        // Advanced AI-powered recommendations with business context
        recommendations = await generateAIRecommendations(userUsage, printerStatus, costData);

        // Generate specific recommendations based on type
        specificRecommendations = await generateSpecificRecommendations(
          type,
          userUsage,
          printerStatus,
          costData
        );

        // Generate comprehensive cost optimization report
        const analysisData = {
          userUsage,
          printerStatus,
          costData,
          type,
          department,
          totalUsers: userUsage.length,
          totalPrinters: printerStatus.length,
          totalMonthlyCost: costData.reduce((sum, item) => sum + item.totalCost, 0)
        };
        
        costOptimizationReport = await generateCostOptimizationReport(analysisData);

        // Sentiment analysis of recent print job patterns (if applicable)
        if (type === 'general' && userUsage.length > 0) {
          const jobDescriptions = userUsage.slice(0, 5).map(user => 
            `Usuário ${user.name} - ${user.totalJobs} jobs, R$ ${user.totalCost.toFixed(2)}, ${user.department}`
          );
          sentimentAnalysis = await analyzePrintJobSentiment(jobDescriptions);
        }

        // Calculate enhanced potential savings
        potentialSavings = calculateEnhancedPotentialSavings(userUsage, costData, type);
        
      } catch (aiError) {
        console.error('AI recommendations error:', aiError);
        // Fallback to enhanced mock data
        const mockData = getMockRecommendations();
        recommendations = mockData.recommendations.slice(0, 3);
        specificRecommendations = await generateSpecificRecommendations(type, userUsage, printerStatus, costData);
        potentialSavings = mockData.potentialSavings;
        costOptimizationReport = null;
        sentimentAnalysis = null;
      }
    } else {
      // Enhanced mock data for development/testing
      const mockData = getMockRecommendations();
      recommendations = mockData.recommendations.slice(0, 3);
      specificRecommendations = mockData.recommendations.slice(3);
      potentialSavings = {
        ...mockData.potentialSavings,
        aiEnhanced: false,
        confidenceLevel: 'mock_data'
      };
      
      // Mock cost optimization report
      costOptimizationReport = {
        executiveSummary: {
          currentMonthlyCost: costData.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2),
          potentialSavings: (costData.reduce((sum, item) => sum + item.totalCost, 0) * 0.25).toFixed(2),
          roi: '220%',
          paybackPeriod: '2.8 meses',
          priority: type
        },
        implementation: {
          timeline: '60 dias',
          effort: 'Médio',
          impact: 'Alto'
        }
      };
      
      sentimentAnalysis = {
        overall: 'neutral',
        insights: ['Análise de sentimento com dados simulados']
      };
      
      // Simulate comprehensive AI processing time
      await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 1200));
    }

    return NextResponse.json({
      recommendations: {
        primary: recommendations,
        specific: specificRecommendations,
        combined: [...recommendations, ...specificRecommendations],
        priority: rankRecommendationsByImpact([...recommendations, ...specificRecommendations])
      },
      potentialSavings,
      costOptimization: costOptimizationReport,
      sentimentAnalysis,
      dataAnalysis: {
        userUsage: userUsage.length,
        printerStatus: printerStatus.length,
        totalCost: costData.reduce((sum, item) => sum + item.totalCost, 0),
        averageCostPerUser: userUsage.length > 0 ? 
          costData.reduce((sum, item) => sum + item.totalCost, 0) / userUsage.length : 0,
        highUsageUsers: userUsage.filter(user => user.totalCost > 50).length,
        underutilizedPrinters: printerStatus.filter(printer => (printer.utilization || 0) < 30).length,
        colorUsageRatio: userUsage.reduce((sum, user) => sum + user.colorJobs, 0) / 
                         userUsage.reduce((sum, user) => sum + user.totalJobs, 0) || 0
      },
      insights: {
        topCostDepartment: costData.sort((a, b) => b.totalCost - a.totalCost)[0]?.department || 'N/A',
        mostActiveUser: userUsage.sort((a, b) => b.totalJobs - a.totalJobs)[0]?.name || 'N/A',
        efficiencyScore: calculateEfficiencyScore(userUsage, printerStatus, costData),
        sustainabilityGrade: calculateSustainabilityGrade(costData)
      },
      metadata: {
        aiProvider: isAzureAIConfigured() ? 'azure-openai' : 'mock',
        analysisType: type,
        generatedAt: new Date().toISOString(),
        confidence: isAzureAIConfigured() ? 'high' : 'mock',
        dataPoints: userUsage.length + printerStatus.length + costData.length
      },
      type,
      filters: {
        department,
        userId,
        appliedAt: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserUsageData(department?: string | null, userId?: string | null) {
  const where: any = {};
  
  if (userId) {
    where.id = userId;
  } else if (department) {
    where.department = department;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      printQuotas: true,
      printJobs: {
        where: {
          submittedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
          },
        },
      },
    },
    take: 50,
  });

  return users.map(user => {
    const quota = user.printQuotas[0];
    const jobs = user.printJobs;
    const totalCost = jobs.reduce((sum, job) => sum + job.cost, 0);
    const totalPages = jobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
    const colorJobs = jobs.filter(job => job.isColor).length;

    return {
      userId: user.id,
      name: user.name,
      department: user.department,
      totalJobs: jobs.length,
      totalCost,
      totalPages,
      colorJobs,
      quotaUsage: quota ? {
        monthlyUsage: quota.currentUsage,
        monthlyLimit: quota.monthlyLimit,
        colorUsage: quota.colorUsage,
        colorLimit: quota.colorLimit,
        usagePercentage: (quota.currentUsage / quota.monthlyLimit) * 100,
      } : null,
    };
  });
}

async function getPrinterStatusData(department?: string | null) {
  const where: any = {};
  
  if (department) {
    where.department = department;
  }

  const printers = await prisma.printer.findMany({
    where,
    include: {
      printJobs: {
        where: {
          submittedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
  });

  return printers.map(printer => {
    const jobs = printer.printJobs;
    const utilization = jobs.length / (printer.monthlyQuota || 1000) * 100;
    const totalPages = jobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);

    return {
      printerId: printer.id,
      name: printer.name,
      location: printer.location,
      department: printer.department,
      status: printer.status,
      isColorPrinter: printer.isColorPrinter,
      utilization,
      totalJobs: jobs.length,
      totalPages,
      monthlyQuota: printer.monthlyQuota,
    };
  });
}

async function getCostAnalysisData(department?: string | null, userId?: string | null) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const where: any = {
    submittedAt: {
      gte: thirtyDaysAgo,
    },
  };

  if (userId) {
    where.userId = userId;
  } else if (department) {
    where.user = {
      department: department,
    };
  }

  const printJobs = await prisma.printJob.findMany({
    where,
    include: {
      user: {
        select: {
          department: true,
        },
      },
    },
  });

  // Group by department
  const departmentCosts: { [dept: string]: any } = {};

  printJobs.forEach(job => {
    const dept = job.user?.department || 'Unknown';
    if (!departmentCosts[dept]) {
      departmentCosts[dept] = {
        department: dept,
        totalCost: 0,
        totalPages: 0,
        colorCost: 0,
        bwCost: 0,
        jobCount: 0,
      };
    }

    departmentCosts[dept].totalCost += job.cost;
    departmentCosts[dept].totalPages += job.pages * job.copies;
    departmentCosts[dept].jobCount += 1;

    if (job.isColor) {
      departmentCosts[dept].colorCost += job.cost;
    } else {
      departmentCosts[dept].bwCost += job.cost;
    }
  });

  return Object.values(departmentCosts);
}

async function generateSpecificRecommendations(
  type: string,
  userUsage: any[],
  printerStatus: any[],
  costData: any[]
): Promise<string[]> {
  const recommendations: string[] = [];

  switch (type) {
    case 'cost':
      // Cost-focused recommendations
      const highCostUsers = userUsage.filter(user => user.totalCost > 50);
      if (highCostUsers.length > 0) {
        recommendations.push(`${highCostUsers.length} usuários com custos acima de R$ 50/mês. Considere revisar necessidades de impressão.`);
      }

      const highColorUsage = userUsage.filter(user => user.colorJobs > user.totalJobs * 0.3);
      if (highColorUsage.length > 0) {
        recommendations.push(`${highColorUsage.length} usuários com alto uso de impressão colorida. Implemente política de aprovação para impressões coloridas.`);
      }
      break;

    case 'sustainability':
      const totalPages = userUsage.reduce((sum, user) => sum + user.totalPages, 0);
      const avgPagesPerJob = totalPages / userUsage.reduce((sum, user) => sum + user.totalJobs, 0);
      
      if (avgPagesPerJob > 5) {
        recommendations.push(`Média de ${avgPagesPerJob.toFixed(1)} páginas por job. Promova impressão duplex e revisão digital.`);
      }

      recommendations.push('Configure impressão duplex como padrão para reduzir consumo de papel em 50%.');
      recommendations.push('Implemente "segurar impressão" para evitar desperdício de documentos não coletados.');
      break;

    case 'efficiency':
      const underutilizedPrinters = printerStatus.filter(printer => printer.utilization < 30);
      if (underutilizedPrinters.length > 0) {
        recommendations.push(`${underutilizedPrinters.length} impressoras subutilizadas. Considere redistribuição ou consolidação.`);
      }

      const overutilizedPrinters = printerStatus.filter(printer => printer.utilization > 80);
      if (overutilizedPrinters.length > 0) {
        recommendations.push(`${overutilizedPrinters.length} impressoras sobrecarregadas. Considere adicionar capacidade ou redistribuir carga.`);
      }
      break;
  }

  return recommendations;
}

function calculatePotentialSavings(userUsage: any[], costData: any[]) {
  const totalCost = costData.reduce((sum, dept) => sum + dept.totalCost, 0);
  
  // Estimate potential savings based on common optimizations
  const potentialSavings = {
    duplexPrinting: totalCost * 0.3, // 30% savings on paper
    colorOptimization: costData.reduce((sum, dept) => sum + dept.colorCost, 0) * 0.2, // 20% reduction in color printing
    quotaOptimization: totalCost * 0.15, // 15% overall cost reduction through better quota management
  };

  return {
    ...potentialSavings,
    totalPotential: Object.values(potentialSavings).reduce((sum, saving) => sum + saving, 0),
    currentMonthlyCost: totalCost,
  };
}

// Enhanced savings calculation with AI analysis
function calculateEnhancedPotentialSavings(userUsage: any[], costData: any[], type: string) {
  const totalCost = costData.reduce((sum, dept) => sum + dept.totalCost, 0);
  const totalPages = costData.reduce((sum, dept) => sum + dept.totalPages, 0);
  const colorCost = costData.reduce((sum, dept) => sum + dept.colorCost, 0);
  
  // Base optimizations
  const baseSavings = {
    duplexPrinting: totalCost * 0.35, // Enhanced 35% savings with better implementation
    colorOptimization: colorCost * 0.25, // 25% reduction through policy changes
    quotaOptimization: totalCost * 0.18, // 18% through AI-driven quota management
    workflowOptimization: totalCost * 0.12, // 12% through digital workflows
  };

  // Type-specific optimizations
  let specificSavings = {};
  
  switch (type) {
    case 'cost':
      specificSavings = {
        printerConsolidation: totalCost * 0.08,
        bulkPurchasing: totalCost * 0.05,
        vendorNegotiation: totalCost * 0.03,
      };
      break;
    case 'sustainability':
      specificSavings = {
        paperReduction: totalPages * 0.04 * 0.4, // 40% paper reduction at R$0.04/page
        energyEfficiency: totalCost * 0.06,
        wasteReduction: totalCost * 0.04,
      };
      break;
    case 'efficiency':
      specificSavings = {
        automationSavings: totalCost * 0.15,
        maintenanceOptimization: totalCost * 0.08,
        capacityBalancing: totalCost * 0.10,
      };
      break;
    default:
      specificSavings = {
        generalOptimization: totalCost * 0.10,
        policyEnforcement: totalCost * 0.07,
      };
  }

  const allSavings = { ...baseSavings, ...specificSavings };
  const totalPotential = Object.values(allSavings).reduce((sum: number, saving: number) => sum + saving, 0);

  return {
    ...allSavings,
    totalPotential,
    currentMonthlyCost: totalCost,
    annualPotential: totalPotential * 12,
    roi: ((totalPotential * 12) / (totalCost * 12)) * 100,
    paybackMonths: totalCost > 0 ? Math.round(totalCost / totalPotential) : 0,
    confidenceLevel: 'high',
    implementationComplexity: type === 'efficiency' ? 'high' : type === 'cost' ? 'medium' : 'low'
  };
}

// Rank recommendations by business impact
function rankRecommendationsByImpact(recommendations: string[]): { recommendation: string; impact: string; priority: number }[] {
  return recommendations.map((rec, index) => {
    let impact = 'medium';
    let priority = index + 1;
    
    // Determine impact based on keywords
    if (rec.toLowerCase().includes('r$') || rec.toLowerCase().includes('economia')) {
      impact = 'high';
      priority = Math.max(1, priority - 2);
    } else if (rec.toLowerCase().includes('duplex') || rec.toLowerCase().includes('cor')) {
      impact = 'high';
      priority = Math.max(1, priority - 1);
    } else if (rec.toLowerCase().includes('sustentab') || rec.toLowerCase().includes('ambiente')) {
      impact = 'medium';
    } else if (rec.toLowerCase().includes('manuten') || rec.toLowerCase().includes('error')) {
      impact = 'high';
      priority = 1;
    }
    
    return {
      recommendation: rec,
      impact,
      priority
    };
  }).sort((a, b) => a.priority - b.priority);
}

// Calculate overall efficiency score
function calculateEfficiencyScore(userUsage: any[], printerStatus: any[], costData: any[]): number {
  let score = 100; // Start with perfect score
  
  // Deduct points for inefficiencies
  const totalCost = costData.reduce((sum, dept) => sum + dept.totalCost, 0);
  const averageCostPerPage = totalCost / costData.reduce((sum, dept) => sum + dept.totalPages, 0);
  
  // Cost efficiency
  if (averageCostPerPage > 0.10) score -= 20;
  else if (averageCostPerPage > 0.08) score -= 10;
  
  // Utilization efficiency
  const underutilized = printerStatus.filter(p => (p.utilization || 0) < 30).length;
  const overutilized = printerStatus.filter(p => (p.utilization || 0) > 90).length;
  score -= (underutilized + overutilized) * 5;
  
  // Color usage efficiency
  const colorRatio = userUsage.reduce((sum, user) => sum + user.colorJobs, 0) / 
                     userUsage.reduce((sum, user) => sum + user.totalJobs, 0);
  if (colorRatio > 0.4) score -= 15;
  else if (colorRatio > 0.3) score -= 8;
  
  // High usage users (potential waste)
  const highUsageUsers = userUsage.filter(user => user.totalCost > 100).length;
  score -= highUsageUsers * 3;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate sustainability grade
function calculateSustainabilityGrade(costData: any[]): string {
  let score = 100;
  
  const totalPages = costData.reduce((sum, dept) => sum + dept.totalPages, 0);
  const colorCost = costData.reduce((sum, dept) => sum + dept.colorCost, 0);
  const totalCost = costData.reduce((sum, dept) => sum + dept.totalCost, 0);
  
  // Color usage impact
  const colorRatio = colorCost / totalCost;
  if (colorRatio > 0.4) score -= 25;
  else if (colorRatio > 0.3) score -= 15;
  else if (colorRatio > 0.2) score -= 8;
  
  // Volume impact  
  if (totalPages > 2000) score -= 20;
  else if (totalPages > 1500) score -= 12;
  else if (totalPages > 1000) score -= 6;
  
  // Cost efficiency (indicates waste)
  const avgCostPerPage = totalCost / totalPages;
  if (avgCostPerPage > 0.12) score -= 15;
  else if (avgCostPerPage > 0.10) score -= 8;
  
  // Return letter grade
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 65) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}