import { NextRequest, NextResponse } from 'next/server';
import { PrinterIntegrationService } from '@/lib/printer-integration';

const integrationService = new PrinterIntegrationService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const printerId = searchParams.get('printerId');
    const type = searchParams.get('type');

    if (!printerId) {
      return NextResponse.json(
        { error: 'printerId is required' },
        { status: 400 }
      );
    }

    const integration = await integrationService.getIntegration(printerId, type || undefined);

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error fetching printer integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ['printerId', 'type', 'endpoint', 'authType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const validTypes = ['SNMP', 'HTTP', 'IPP', 'WSD'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid integration type' },
        { status: 400 }
      );
    }

    const validAuthTypes = ['NONE', 'BASIC', 'API_KEY', 'CERTIFICATE'];
    if (!validAuthTypes.includes(body.authType)) {
      return NextResponse.json(
        { error: 'Invalid auth type' },
        { status: 400 }
      );
    }

    const integration = await integrationService.createIntegration({
      printerId: body.printerId,
      type: body.type,
      endpoint: body.endpoint,
      authType: body.authType,
      credentials: body.credentials,
      pollInterval: body.pollInterval,
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error creating printer integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}