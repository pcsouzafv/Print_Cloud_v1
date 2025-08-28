import { NextRequest, NextResponse } from 'next/server';
import { PrinterIntegrationService } from '@/lib/printer-integration';

const integrationService = new PrinterIntegrationService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const printerId = searchParams.get('printerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (printerId) where.printerId = printerId;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const captures = await integrationService.getUnprocessedCaptures(printerId || undefined);

    return NextResponse.json({
      captures,
      pagination: {
        page,
        limit,
        total: captures.length,
        totalPages: Math.ceil(captures.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching captured jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = [
      'printerId', 'externalJobId', 'fileName', 
      'pages', 'copies', 'paperSize', 'paperType', 'quality'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (typeof body.pages !== 'number' || body.pages <= 0) {
      return NextResponse.json(
        { error: 'pages must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof body.copies !== 'number' || body.copies <= 0) {
      return NextResponse.json(
        { error: 'copies must be a positive number' },
        { status: 400 }
      );
    }

    const capture = await integrationService.captureJob({
      printerId: body.printerId,
      externalJobId: body.externalJobId,
      fileName: body.fileName,
      pages: body.pages,
      copies: body.copies,
      isColor: body.isColor || false,
      paperSize: body.paperSize,
      paperType: body.paperType,
      quality: body.quality,
      metadata: body.metadata,
    });

    return NextResponse.json(capture, { status: 201 });
  } catch (error) {
    console.error('Error capturing print job:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Job already captured' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}