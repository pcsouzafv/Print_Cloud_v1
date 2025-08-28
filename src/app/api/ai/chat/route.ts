import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getChatCompletion } from '@/lib/azure-ai';
import { getMockChatResponse, isAzureAIConfigured } from '@/lib/mock-ai';

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
        console.warn('Could not gather user context:', error);
      }
    }

    // Get AI response (use mock if Azure AI not configured)
    let response;
    if (isAzureAIConfigured()) {
      response = await getChatCompletion(message, context);
    } else {
      response = getMockChatResponse(message);
      // Add slight delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
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
      context: context ? {
        userStats: context.userStats,
        hasRecentActivity: context.printJobs.length > 0,
      } : null,
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