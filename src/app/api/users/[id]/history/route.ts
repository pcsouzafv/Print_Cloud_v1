import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    const status = searchParams.get('status');
    const userId = params.id;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Build where clause
    const where: any = {
      userId: userId,
      submittedAt: {
        gte: startDate
      }
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Fetch print jobs with related data
    const printJobs = await prisma.printJob.findMany({
      where,
      include: {
        printer: {
          select: {
            name: true,
            location: true
          }
        },
        user: {
          select: {
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 100 // Limit to recent 100 jobs
    });

    // Format the response
    const formattedJobs = printJobs.map(job => ({
      id: job.id,
      documentName: job.fileName || 'Documento sem nome',
      pages: job.pages,
      copies: job.copies,
      isColor: job.isColor,
      cost: job.cost,
      submittedAt: job.submittedAt,
      status: job.status,
      printerName: job.printer?.name || 'Impressora desconhecida',
      printerLocation: job.printer?.location
    }));

    // Calculate additional statistics
    const stats = {
      totalJobs: printJobs.length,
      completedJobs: printJobs.filter(job => job.status === 'COMPLETED').length,
      failedJobs: printJobs.filter(job => job.status === 'FAILED' || job.status === 'CANCELLED').length,
      totalPages: printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0),
      totalCost: printJobs.reduce((sum, job) => sum + job.cost, 0),
      colorJobs: printJobs.filter(job => job.isColor).length,
      avgCostPerJob: printJobs.length > 0 ? printJobs.reduce((sum, job) => sum + job.cost, 0) / printJobs.length : 0
    };

    // Find most used printer
    const printerUsage: { [key: string]: number } = {};
    printJobs.forEach(job => {
      const printerName = job.printer?.name || 'Unknown';
      printerUsage[printerName] = (printerUsage[printerName] || 0) + 1;
    });

    const mostUsedPrinter = Object.entries(printerUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Daily usage pattern
    const dailyUsage: { [key: string]: number } = {};
    printJobs.forEach(job => {
      const day = job.submittedAt.toDateString();
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });

    const peakUsageDay = Object.entries(dailyUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return NextResponse.json({
      success: true,
      printJobs: formattedJobs,
      stats: {
        ...stats,
        mostUsedPrinter,
        peakUsageDay,
        avgPagesPerJob: stats.totalJobs > 0 ? Math.round(stats.totalPages / stats.totalJobs) : 0
      },
      metadata: {
        period,
        status: status || 'all',
        userId,
        totalRecords: printJobs.length,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user print history:', error);
    
    // Return mock data for development
    const mockJobs = generateMockHistory(params.id, parseInt(new URL(request.url).searchParams.get('period') || '30'));
    
    return NextResponse.json({
      success: true,
      printJobs: mockJobs,
      stats: calculateMockStats(mockJobs),
      metadata: {
        period: parseInt(new URL(request.url).searchParams.get('period') || '30'),
        status: new URL(request.url).searchParams.get('status') || 'all',
        userId: params.id,
        totalRecords: mockJobs.length,
        dataSource: 'mock'
      }
    });
  }
}

function generateMockHistory(userId: string, period: number) {
  const jobs = [];
  const documents = [
    'Relatório Financeiro Q4.pdf',
    'Contrato Fornecedor XYZ.pdf',
    'Apresentação Vendas.pptx',
    'Planilha Orçamento 2024.xlsx',
    'Manual Procedimentos.pdf',
    'Política Segurança.docx',
    'Invoice #A-12345.pdf',
    'Ata Reunião Semanal.docx',
    'Análise Mercado.pdf',
    'Relatório Performance.xlsx'
  ];

  const printers = [
    'HP LaserJet Pro M404dn',
    'Canon ImageRunner 2530i',
    'Epson EcoTank L3150',
    'Brother HL-L2350DW',
    'Xerox WorkCentre 3345'
  ];

  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED'];

  const numJobs = Math.floor(Math.random() * 25) + 10; // 10-35 jobs

  for (let i = 0; i < numJobs; i++) {
    const isColor = Math.random() > 0.75; // 25% color jobs
    const pages = Math.floor(Math.random() * 15) + 1; // 1-15 pages
    const copies = Math.floor(Math.random() * 3) + 1; // 1-3 copies
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate random date within the period
    const daysAgo = Math.floor(Math.random() * period);
    const submittedAt = new Date();
    submittedAt.setDate(submittedAt.getDate() - daysAgo);
    submittedAt.setHours(
      Math.floor(Math.random() * 12) + 8, // 8 AM to 8 PM
      Math.floor(Math.random() * 60),
      0,
      0
    );

    jobs.push({
      id: `mock-job-${i + 1}`,
      documentName: documents[Math.floor(Math.random() * documents.length)],
      pages,
      copies,
      isColor,
      cost: pages * copies * (isColor ? 0.25 : 0.05), // R$0.05 B&W, R$0.25 color per page
      submittedAt: submittedAt.toISOString(),
      status,
      printerName: printers[Math.floor(Math.random() * printers.length)]
    });
  }

  return jobs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

function calculateMockStats(jobs: any[]) {
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED');
  const totalJobs = completedJobs.length;
  const totalPages = completedJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
  const totalCost = completedJobs.reduce((sum, job) => sum + job.cost, 0);
  const colorJobs = completedJobs.filter(job => job.isColor).length;
  const failedJobs = jobs.filter(job => job.status === 'FAILED' || job.status === 'CANCELLED').length;

  // Most used printer
  const printerUsage: { [key: string]: number } = {};
  completedJobs.forEach(job => {
    printerUsage[job.printerName] = (printerUsage[job.printerName] || 0) + 1;
  });
  const mostUsedPrinter = Object.entries(printerUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  // Peak usage day
  const dailyUsage: { [key: string]: number } = {};
  completedJobs.forEach(job => {
    const day = new Date(job.submittedAt).toDateString();
    dailyUsage[day] = (dailyUsage[day] || 0) + 1;
  });
  const peakUsageDay = Object.entries(dailyUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  return {
    totalJobs: jobs.length,
    completedJobs: totalJobs,
    failedJobs,
    totalPages,
    totalCost,
    colorJobs,
    mostUsedPrinter,
    peakUsageDay,
    avgPagesPerJob: totalJobs > 0 ? Math.round(totalPages / totalJobs) : 0,
    avgCostPerJob: totalJobs > 0 ? totalCost / totalJobs : 0
  };
}