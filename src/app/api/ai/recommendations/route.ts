import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIRecommendations } from '@/lib/azure-ai';
import { getMockRecommendations, isAzureAIConfigured } from '@/lib/mock-ai';

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

    // Generate recommendations (use mock if Azure AI not configured)
    let recommendations, specificRecommendations, potentialSavings;
    
    if (isAzureAIConfigured() && userUsage.length > 0) {
      // Generate AI-powered recommendations
      recommendations = await generateAIRecommendations(userUsage, printerStatus, costData);

      // Add specific recommendations based on type
      specificRecommendations = await generateSpecificRecommendations(
        type,
        userUsage,
        printerStatus,
        costData
      );

      // Calculate potential savings
      potentialSavings = calculatePotentialSavings(userUsage, costData);
    } else {
      // Use mock data for development/testing
      const mockData = getMockRecommendations();
      recommendations = mockData.recommendations.slice(0, 3);
      specificRecommendations = mockData.recommendations.slice(3);
      potentialSavings = mockData.potentialSavings;
      
      // Add slight delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }

    return NextResponse.json({
      recommendations: [...recommendations, ...specificRecommendations],
      potentialSavings,
      dataAnalysis: {
        userUsage: userUsage.length,
        printerStatus: printerStatus.length,
        totalCost: costData.reduce((sum, item) => sum + item.totalCost, 0),
      },
      type,
      filters: {
        department,
        userId,
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