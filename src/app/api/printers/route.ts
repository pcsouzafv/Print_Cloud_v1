import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (department && department !== 'all') {
      where.department = department;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [printers, total] = await Promise.all([
      prisma.printer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          printJobs: {
            where: {
              submittedAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            },
            select: {
              pages: true,
              copies: true,
            }
          }
        }
      }),
      prisma.printer.count({ where }),
    ]);

    // Calculate current usage for each printer
    const printersWithUsage = printers.map(printer => {
      const currentUsage = printer.printJobs.reduce((total, job) => {
        return total + (job.pages * job.copies);
      }, 0);

      const { printJobs, ...printerData } = printer;
      return {
        ...printerData,
        currentUsage
      };
    });

    return NextResponse.json({
      printers: printersWithUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const printer = await prisma.printer.create({
      data: {
        name: body.name,
        model: body.model,
        location: body.location,
        ipAddress: body.ipAddress,
        serialNumber: body.serialNumber,
        department: body.department,
        isColorPrinter: body.isColorPrinter || false,
        monthlyQuota: body.monthlyQuota || 1000,
        status: body.status || 'ACTIVE',
      },
    });

    return NextResponse.json(printer, { status: 201 });
  } catch (error) {
    console.error('Error creating printer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}