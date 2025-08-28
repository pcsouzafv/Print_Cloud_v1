import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzePrintPatterns } from '@/lib/azure-ai';
import { getMockAnalysisData, isAzureAIConfigured } from '@/lib/mock-ai';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days
    const department = searchParams.get('department');
    const userId = searchParams.get('userId');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Build query filters
    const where: any = {
      submittedAt: {
        gte: startDate,
      },
    };

    if (department) {
      where.user = {
        department: department,
      };
    }

    if (userId) {
      where.userId = userId;
    }

    // Fetch print jobs with related data
    const printJobs = await prisma.printJob.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
        printer: {
          select: {
            name: true,
            location: true,
            isColorPrinter: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Analyze patterns with AI (use mock if Azure AI not configured)
    let analysis;
    if (isAzureAIConfigured() && printJobs.length > 0) {
      analysis = await analyzePrintPatterns(printJobs);
    } else {
      // Use mock data for development/testing
      const mockData = getMockAnalysisData(parseInt(period));
      analysis = mockData.analysis;
      
      // Add slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    }

    // Additional statistics
    const stats = {
      totalJobs: printJobs.length,
      totalPages: printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0),
      totalCost: printJobs.reduce((sum, job) => sum + job.cost, 0),
      colorJobs: printJobs.filter(job => job.isColor).length,
      averageCostPerPage: printJobs.length > 0 
        ? printJobs.reduce((sum, job) => sum + job.cost, 0) / printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0)
        : 0,
      topDepartments: getTopDepartments(printJobs),
      dailyTrends: getDailyTrends(printJobs, parseInt(period)),
    };

    return NextResponse.json({
      analysis,
      stats,
      period: parseInt(period),
      filters: {
        department,
        userId,
      },
    });
  } catch (error) {
    console.error('Error analyzing print patterns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTopDepartments(printJobs: any[]) {
  const departmentStats: { [dept: string]: { jobs: number; cost: number; pages: number } } = {};

  printJobs.forEach(job => {
    const dept = job.user?.department || 'Unknown';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { jobs: 0, cost: 0, pages: 0 };
    }
    departmentStats[dept].jobs += 1;
    departmentStats[dept].cost += job.cost;
    departmentStats[dept].pages += job.pages * job.copies;
  });

  return Object.entries(departmentStats)
    .map(([department, stats]) => ({ department, ...stats }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
}

function getDailyTrends(printJobs: any[], days: number) {
  const dailyStats: { [date: string]: { jobs: number; cost: number; pages: number } } = {};

  // Initialize all days in period
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyStats[dateKey] = { jobs: 0, cost: 0, pages: 0 };
  }

  printJobs.forEach(job => {
    const dateKey = new Date(job.submittedAt).toISOString().split('T')[0];
    if (dailyStats[dateKey]) {
      dailyStats[dateKey].jobs += 1;
      dailyStats[dateKey].cost += job.cost;
      dailyStats[dateKey].pages += job.pages * job.copies;
    }
  });

  return Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}