import { NextRequest, NextResponse } from 'next/server';
import { PrinterIntegrationService } from '@/lib/printer-integration';
import { prisma } from '@/lib/prisma';

const integrationService = new PrinterIntegrationService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const captureId = params.id;
    const body = await request.json();
    
    if (!captureId) {
      return NextResponse.json(
        { error: 'Capture ID is required' },
        { status: 400 }
      );
    }

    const userId = body.userId;

    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    await integrationService.processCapture(captureId, userId);

    return NextResponse.json(
      { success: true, message: 'Capture processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing capture:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Capture not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Quota exceeded')) {
        return NextResponse.json(
          { error: 'User quota exceeded' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}