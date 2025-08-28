import { NextRequest, NextResponse } from 'next/server';
import { getPollingService } from '@/lib/printer-polling';

const pollingService = getPollingService();

export async function GET(request: NextRequest) {
  try {
    const status = pollingService.getPollingStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching polling status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        await pollingService.startPolling();
        return NextResponse.json({
          success: true,
          message: 'Polling service started',
          status: pollingService.getPollingStatus(),
        });

      case 'stop':
        await pollingService.stopPolling();
        return NextResponse.json({
          success: true,
          message: 'Polling service stopped',
          status: pollingService.getPollingStatus(),
        });

      case 'restart':
        await pollingService.restartPolling();
        return NextResponse.json({
          success: true,
          message: 'Polling service restarted',
          status: pollingService.getPollingStatus(),
        });

      case 'add_printer':
        if (!body.integrationId) {
          return NextResponse.json(
            { error: 'integrationId is required for add_printer action' },
            { status: 400 }
          );
        }
        await pollingService.addPrinterToPolling(body.integrationId);
        return NextResponse.json({
          success: true,
          message: 'Printer added to polling',
          status: pollingService.getPollingStatus(),
        });

      case 'remove_printer':
        if (!body.printerId) {
          return NextResponse.json(
            { error: 'printerId is required for remove_printer action' },
            { status: 400 }
          );
        }
        await pollingService.removePrinterFromPolling(body.printerId);
        return NextResponse.json({
          success: true,
          message: 'Printer removed from polling',
          status: pollingService.getPollingStatus(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error controlling polling service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}