import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const printerId = searchParams.get('printerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (printerId) where.printerId = printerId;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt.gte = new Date(startDate);
      if (endDate) where.submittedAt.lte = new Date(endDate);
    }

    const [printJobs, total] = await Promise.all([
      prisma.printJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
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
              model: true,
            },
          },
        },
      }),
      prisma.printJob.count({ where }),
    ]);

    return NextResponse.json({
      printJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching print jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate user quota before creating print job
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      include: { printQuotas: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const quota = user.printQuotas[0];
    if (!quota) {
      return NextResponse.json(
        { error: 'User quota not found' },
        { status: 404 }
      );
    }

    const totalPages = body.pages * body.copies;
    
    // Check quota limits
    if (body.isColor) {
      if (quota.colorUsage + totalPages > quota.colorLimit) {
        return NextResponse.json(
          { error: 'Color quota exceeded' },
          { status: 400 }
        );
      }
    } else {
      if (quota.currentUsage + totalPages > quota.monthlyLimit) {
        return NextResponse.json(
          { error: 'Monthly quota exceeded' },
          { status: 400 }
        );
      }
    }

    // Get print cost
    const printCost = await prisma.printCost.findUnique({
      where: { department: user.department },
    });

    const costPerPage = body.isColor 
      ? (printCost?.colorPage || 0.15) 
      : (printCost?.blackAndWhitePage || 0.05);
    
    const totalCost = totalPages * costPerPage;

    // Create print job
    const printJob = await prisma.printJob.create({
      data: {
        userId: body.userId,
        printerId: body.printerId,
        fileName: body.fileName,
        pages: body.pages,
        copies: body.copies,
        isColor: body.isColor,
        cost: totalCost,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        printer: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

    // Update user quota
    await prisma.printQuota.update({
      where: { userId: body.userId },
      data: {
        currentUsage: body.isColor 
          ? quota.currentUsage 
          : quota.currentUsage + totalPages,
        colorUsage: body.isColor 
          ? quota.colorUsage + totalPages 
          : quota.colorUsage,
      },
    });

    return NextResponse.json(printJob, { status: 201 });
  } catch (error) {
    console.error('Error creating print job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}