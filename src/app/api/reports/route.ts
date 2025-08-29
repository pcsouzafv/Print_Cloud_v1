import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateRange = parseInt(searchParams.get('dateRange') || '30');
    const reportType = searchParams.get('reportType') || 'overview';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    // Get print jobs for the date range
    const printJobs = await prisma.printJob.findMany({
      where: {
        submittedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true,
        printer: true
      }
    });

    // Get all printers and users for calculations
    const [printers, users] = await Promise.all([
      prisma.printer.findMany({
        include: {
          printJobs: {
            where: {
              submittedAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }),
      prisma.user.findMany({
        include: {
          printJobs: {
            where: {
              submittedAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      })
    ]);

    // Calculate metrics
    const totalPrintJobs = printJobs.length;
    const totalPages = printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
    
    // Calculate costs (assuming R$ 0.05 for B&W, R$ 0.25 for color)
    const totalCost = printJobs.reduce((sum, job) => {
      const costPerPage = job.isColor ? 0.25 : 0.05;
      return sum + (job.pages * job.copies * costPerPage);
    }, 0);

    const activeUsers = users.filter(user => user.printJobs.length > 0).length;
    const activePrinters = printers.filter(printer => printer.printJobs.length > 0).length;

    // Top printers by jobs
    const topPrinters = printers
      .map(printer => ({
        name: printer.name,
        jobs: printer.printJobs.length,
        pages: printer.printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0)
      }))
      .filter(printer => printer.jobs > 0)
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);

    // Top users by jobs
    const topUsers = users
      .map(user => ({
        name: user.name,
        department: user.department,
        jobs: user.printJobs.length,
        pages: user.printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0)
      }))
      .filter(user => user.jobs > 0)
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);

    // Monthly data (last 5 months)
    const monthlyData = [];
    for (let i = 4; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthJobs = printJobs.filter(job => 
        job.submittedAt >= monthStart && job.submittedAt <= monthEnd
      );

      const monthPages = monthJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
      const monthCost = monthJobs.reduce((sum, job) => {
        const costPerPage = job.isColor ? 0.25 : 0.05;
        return sum + (job.pages * job.copies * costPerPage);
      }, 0);

      monthlyData.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
        jobs: monthJobs.length,
        pages: monthPages,
        cost: monthCost
      });
    }

    // Department usage
    const departmentMap = new Map();
    printJobs.forEach(job => {
      const dept = job.user?.department || 'Não especificado';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { jobs: 0, pages: 0, cost: 0 });
      }
      const deptData = departmentMap.get(dept);
      deptData.jobs += 1;
      deptData.pages += job.pages * job.copies;
      deptData.cost += (job.pages * job.copies * (job.isColor ? 0.25 : 0.05));
    });

    const departmentUsage = Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      ...data
    }));

    const reportData = {
      totalPrintJobs,
      totalPages,
      totalCost,
      activeUsers,
      activePrinters,
      topPrinters,
      topUsers,
      monthlyData,
      departmentUsage,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: dateRange
      }
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}