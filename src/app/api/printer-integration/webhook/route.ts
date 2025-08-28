import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/printer-polling';
import { prisma } from '@/lib/prisma';

const webhookService = new WebhookService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-webhook-signature');
    const printerId = request.headers.get('x-printer-id');

    if (!printerId) {
      return NextResponse.json(
        { error: 'Missing printer ID in headers' },
        { status: 400 }
      );
    }

    const printer = await prisma.printer.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      return NextResponse.json(
        { error: 'Printer not found' },
        { status: 404 }
      );
    }

    const integration = await prisma.printerIntegration.findFirst({
      where: { printerId },
    });

    if (signature && integration?.credentials && typeof integration.credentials === 'object' && 'webhookSecret' in integration.credentials) {
      const rawBody = await request.text();
      const isValid = webhookService.validateWebhookSignature(
        rawBody,
        signature,
        integration.credentials.webhookSecret as string
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const result = await webhookService.processWebhook(printerId, body);

    return NextResponse.json({
      success: true,
      result,
      processedAt: new Date(),
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}