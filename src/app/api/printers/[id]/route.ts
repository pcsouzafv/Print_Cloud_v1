import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const printer = await prisma.printer.findUnique({
      where: { id: params.id },
      include: {
        printJobs: {
          take: 10,
          orderBy: { submittedAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!printer) {
      return NextResponse.json(
        { error: 'Printer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(printer);
  } catch (error) {
    console.error('Error fetching printer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const printer = await prisma.printer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        model: body.model,
        location: body.location,
        ipAddress: body.ipAddress,
        status: body.status,
        department: body.department,
        isColorPrinter: body.isColorPrinter,
        monthlyQuota: body.monthlyQuota,
      },
    });

    return NextResponse.json(printer);
  } catch (error) {
    console.error('Error updating printer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.printer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting printer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}