import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (department && department !== 'all') {
      where.department = department;
    }
    
    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          printQuotas: true,
          printJobs: {
            where: {
              submittedAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            },
            select: {
              cost: true,
              submittedAt: true,
              isColor: true,
              pages: true,
              copies: true,
            },
            orderBy: { submittedAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              printJobs: {
                where: {
                  submittedAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                }
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate additional user data
    const usersWithDetails = users.map(user => {
      const quota = user.printQuotas[0];
      const totalCost = user.printJobs.reduce((sum, job) => sum + job.cost, 0);
      const lastPrint = user.printJobs[0]?.submittedAt || null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        azureId: user.azureId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        monthlyQuota: quota?.monthlyLimit || 0,
        currentUsage: quota?.currentUsage || 0,
        colorQuota: quota?.colorLimit || 0,
        colorUsage: quota?.colorUsage || 0,
        totalCost: totalCost,
        lastPrint: lastPrint,
        printJobsCount: user._count.printJobs,
        status: quota && ((quota.currentUsage / quota.monthlyLimit) >= 1 || (quota.colorUsage / quota.colorLimit) >= 1) 
          ? 'quota_exceeded' 
          : 'active'
      };
    });

    return NextResponse.json({
      users: usersWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        department: body.department || 'Geral',
        role: body.role || 'USER',
        azureId: body.azureId || null, // Make azureId optional
      },
    });

    // Create default quota for the user
    await prisma.printQuota.create({
      data: {
        userId: user.id,
        department: user.department,
        monthlyLimit: parseInt(body.monthlyQuota) || 1000,
        colorLimit: Math.floor((parseInt(body.monthlyQuota) || 1000) * 0.2), // 20% of monthly quota for color
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Return more specific error info in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Internal server error';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}