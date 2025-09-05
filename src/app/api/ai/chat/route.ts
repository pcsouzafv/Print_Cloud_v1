import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getChatCompletion, isAzureAIConfigured } from '@/lib/azure-ai';
import { getMockChatResponse } from '@/lib/mock-ai';
import { getMockUserContext, getContextualInsights, MOCK_DATABASE } from '@/lib/mock-database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, includeContext = true } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let context = null;

    // If user provided and context requested, gather relevant data
    if (userId && includeContext) {
      try {
        context = await gatherUserContext(userId);
      } catch (error) {
        console.warn('Could not gather user context from database, using mock data:', error);
        // Use rich mock data when database is not available
        context = getMockUserContext(userId);
        (context as any).isSimulated = true;
      }
    } else if (includeContext) {
      // Even without userId, provide rich contextual data for better AI analysis
      context = getMockUserContext();
      (context as any).isSimulated = true;
      (context as any).systemOverview = {
        totalUsers: MOCK_DATABASE.users.length,
        totalPrinters: MOCK_DATABASE.printers.length,
        totalDepartments: MOCK_DATABASE.departments.length,
        monthlyBudget: MOCK_DATABASE.departments.reduce((sum, d) => sum + d.budget, 0),
        criticalIssues: MOCK_DATABASE.criticalEvents.filter(e => e.severity === 'HIGH').length,
        insights: getContextualInsights()
      };
    }

    // Get enhanced AI response with business context
    let response;
    try {
      if (isAzureAIConfigured()) {
        // Use real Azure OpenAI with enhanced business context
        response = await getChatCompletion(message, {
          userStats: context?.userStats,
          printerStats: context?.printerIssues,
          departmentData: {
            name: (context as any)?.departmentData?.name || context?.user?.department,
            quotaUsage: context?.quotaUsage
          },
          costAnalysis: {
            totalCost: context?.userStats?.totalCost || 0,
            averageCost: context?.userStats?.averageCostPerJob || 0,
            colorRatio: context?.userStats ? 
              (context.userStats.colorJobs / context.userStats.totalJobs) * 100 : 0
          }
        });
      } else {
        // Enhanced mock response with context
        response = getMockChatResponse(message);
        // Add realistic delay to simulate API processing
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      // Fallback to basic mock response
      response = getMockChatResponse(message);
    }

    // Log the interaction for analytics (optional)
    try {
      if (userId) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'AI_CHAT',
            entity: 'ChatInteraction',
            entityId: 'ai-chat',
            details: {
              message: message.substring(0, 100), // Log first 100 chars
              hasContext: !!context,
            },
          },
        });
      }
    } catch (logError) {
      console.warn('Could not log chat interaction:', logError);
    }

    return NextResponse.json({
      response,
      metadata: {
        aiProvider: isAzureAIConfigured() ? 'azure-openai' : 'mock',
        processingTime: Date.now(), // Can be used to calculate response time
        hasContext: !!context,
        contextSummary: context ? {
          userStats: {
            totalJobs: context.userStats?.totalJobs || 0,
            totalCost: context.userStats?.totalCost || 0,
            colorJobsRatio: context.userStats ? 
              Math.round((context.userStats.colorJobs / context.userStats.totalJobs) * 100) : 0
          },
          quotaStatus: context.quotaUsage ? {
            usagePercentage: Math.round(context.quotaUsage.usagePercentage),
            colorUsagePercentage: Math.round(context.quotaUsage.colorUsagePercentage)
          } : null,
          printerIssues: context.printerIssues?.length || 0,
          department: (context as any)?.departmentData?.name || context?.user?.department
        } : null
      }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function gatherUserContext(userId: string) {
  // Get user information
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      printQuotas: true,
    },
  });

  if (!user) {
    return null;
  }

  // Get recent print jobs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const printJobs = await prisma.printJob.findMany({
    where: {
      userId,
      submittedAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      printer: {
        select: {
          name: true,
          location: true,
          isColorPrinter: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
    take: 50,
  });

  // Calculate user statistics
  const totalJobs = printJobs.length;
  const totalPages = printJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
  const totalCost = printJobs.reduce((sum, job) => sum + job.cost, 0);
  const colorJobs = printJobs.filter(job => job.isColor).length;

  // Get quota information
  const quota = user.printQuotas[0];
  const quotaUsage = quota ? {
    monthlyUsage: quota.currentUsage,
    monthlyLimit: quota.monthlyLimit,
    colorUsage: quota.colorUsage,
    colorLimit: quota.colorLimit,
    usagePercentage: (quota.currentUsage / quota.monthlyLimit) * 100,
    colorUsagePercentage: (quota.colorUsage / quota.colorLimit) * 100,
  } : null;

  // Get recent printer issues
  const printerIssues = await prisma.printer.findMany({
    where: {
      status: {
        in: ['MAINTENANCE', 'ERROR'],
      },
      department: user.department,
    },
    select: {
      name: true,
      status: true,
      location: true,
    },
  });

  return {
    user: {
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
    },
    userStats: {
      totalJobs,
      totalPages,
      totalCost,
      colorJobs,
      averagePagesPerJob: totalJobs > 0 ? totalPages / totalJobs : 0,
      averageCostPerJob: totalJobs > 0 ? totalCost / totalJobs : 0,
    },
    quotaUsage,
    printJobs: printJobs.slice(0, 10), // Most recent 10 jobs
    printerIssues,
    department: user.department,
  };
}