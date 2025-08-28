import { NextRequest, NextResponse } from 'next/server';
import { getPollingService } from '@/lib/printer-polling';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const pollingService = getPollingService();
    const pollingStatus = pollingService.getPollingStatus();

    const [
      totalPrinters,
      activePrinters,
      totalIntegrations,
      activeIntegrations,
      unprocessedCaptures,
      recentJobs
    ] = await Promise.all([
      prisma.printer.count(),
      prisma.printer.count({ where: { status: 'ACTIVE' } }),
      prisma.printerIntegration.count(),
      prisma.printerIntegration.count({ where: { isActive: true } }),
      prisma.printJobCapture.count({ where: { status: 'CAPTURED' } }),
      prisma.printJobCapture.count({
        where: {
          capturedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      })
    ]);

    const systemStatus = {
      timestamp: new Date(),
      services: {
        polling: pollingStatus,
        database: {
          connected: true, // If we get here, DB is connected
        },
      },
      statistics: {
        printers: {
          total: totalPrinters,
          active: activePrinters,
          inactive: totalPrinters - activePrinters,
        },
        integrations: {
          total: totalIntegrations,
          active: activeIntegrations,
          inactive: totalIntegrations - activeIntegrations,
        },
        captures: {
          unprocessed: unprocessedCaptures,
          last24Hours: recentJobs,
        },
      },
      health: {
        overall: 'healthy',
        issues: [] as string[],
      },
    };

    // Health checks
    if (!pollingStatus.isRunning && activeIntegrations > 0) {
      systemStatus.health.issues.push('Polling service is not running but integrations are active');
      systemStatus.health.overall = 'warning';
    }

    if (unprocessedCaptures > 100) {
      systemStatus.health.issues.push(`High number of unprocessed captures: ${unprocessedCaptures}`);
      systemStatus.health.overall = 'warning';
    }

    if (activePrinters === 0) {
      systemStatus.health.issues.push('No active printers found');
      systemStatus.health.overall = 'warning';
    }

    return NextResponse.json(systemStatus);
  } catch (error) {
    console.error('Error fetching system status:', error);
    
    return NextResponse.json({
      timestamp: new Date(),
      services: {
        polling: { isRunning: false, error: 'Unable to check' },
        database: { connected: false, error: error instanceof Error ? error.message : String(error) },
      },
      health: {
        overall: 'critical',
        issues: ['Database connection failed', error instanceof Error ? error.message : String(error)],
      },
    }, { status: 500 });
  }
}