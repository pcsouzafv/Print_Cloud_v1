import { NextRequest, NextResponse } from 'next/server';
import { PrinterIntegrationService, createConnector } from '@/lib/printer-integration';

const integrationService = new PrinterIntegrationService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const printerId = searchParams.get('printerId');

    if (!printerId) {
      return NextResponse.json(
        { error: 'printerId is required' },
        { status: 400 }
      );
    }

    const status = await integrationService.getPrinterStatus(printerId);

    if (!status) {
      return NextResponse.json(
        { error: 'Printer status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching printer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['printerId', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const validStatuses = ['ONLINE', 'OFFLINE', 'PRINTING', 'ERROR', 'WARNING'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedPrinter = await integrationService.updatePrinterStatus(
      body.printerId,
      {
        status: body.status,
        tonerLevels: body.tonerLevels,
        paperLevels: body.paperLevels,
        errorMessages: body.errorMessages,
        jobQueue: body.jobQueue,
        totalPagesMonth: body.totalPagesMonth,
      }
    );

    return NextResponse.json(updatedPrinter);
  } catch (error) {
    console.error('Error updating printer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const printerId = searchParams.get('printerId');

    if (!printerId) {
      return NextResponse.json(
        { error: 'printerId is required' },
        { status: 400 }
      );
    }

    const integration = await integrationService.getIntegration(printerId);

    if (!integration) {
      return NextResponse.json(
        { error: 'No integration configured for this printer' },
        { status: 404 }
      );
    }

    try {
      const connector = createConnector(integration);
      const status = await connector.getStatus();
      status.printerId = printerId;

      const updatedPrinter = await integrationService.updatePrinterStatus(
        printerId,
        {
          status: status.status,
          tonerLevels: status.tonerLevels,
          paperLevels: status.paperLevels,
          errorMessages: status.errorMessages,
          jobQueue: status.jobQueue,
          totalPagesMonth: status.totalPagesMonth,
        }
      );

      await integrationService.updateLastSync(integration.id);

      return NextResponse.json({
        printer: updatedPrinter,
        status: status,
        syncedAt: new Date(),
      });
    } catch (connectorError) {
      console.error('Connector error:', connectorError);
      
      await integrationService.updatePrinterStatus(printerId, {
        status: 'ERROR',
        errorMessages: [`Connection failed: ${connectorError}`],
      });

      return NextResponse.json(
        { error: 'Failed to connect to printer', details: connectorError },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error syncing printer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}