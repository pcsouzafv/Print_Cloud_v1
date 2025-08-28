import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (department) {
      where.department = department;
    }
    
    if (status) {
      where.status = status;
    }

    const [printers, total] = await Promise.all([
      prisma.printer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.printer.count({ where }),
    ]);

    return NextResponse.json({
      printers,
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