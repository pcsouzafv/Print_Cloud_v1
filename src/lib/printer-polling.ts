import { PrinterIntegrationService, createConnector } from './printer-integration';
import { prisma } from './prisma';

export class PrinterPollingService {
  private static instance: PrinterPollingService;
  private integrationService: PrinterIntegrationService;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.integrationService = new PrinterIntegrationService();
  }

  static getInstance(): PrinterPollingService {
    if (!PrinterPollingService.instance) {
      PrinterPollingService.instance = new PrinterPollingService();
    }
    return PrinterPollingService.instance;
  }

  async startPolling() {
    if (this.isRunning) {
      console.log('Polling service is already running');
      return;
    }

    console.log('Starting printer polling service...');
    this.isRunning = true;

    try {
      const integrations = await prisma.printerIntegration.findMany({
        where: { isActive: true },
        include: { printer: true },
      });

      for (const integration of integrations) {
        await this.startPrinterPolling(integration);
      }

      console.log(`Started polling for ${integrations.length} printers`);
    } catch (error) {
      console.error('Error starting polling service:', error);
      this.isRunning = false;
    }
  }

  async stopPolling() {
    if (!this.isRunning) {
      console.log('Polling service is not running');
      return;
    }

    console.log('Stopping printer polling service...');
    
    for (const [printerId, interval] of Array.from(this.pollingIntervals)) {
      clearInterval(interval);
      console.log(`Stopped polling for printer: ${printerId}`);
    }

    this.pollingIntervals.clear();
    this.isRunning = false;
    console.log('Polling service stopped');
  }

  async restartPolling() {
    await this.stopPolling();
    await this.startPolling();
  }

  private async startPrinterPolling(integration: any) {
    const { printerId, pollInterval } = integration;
    
    if (this.pollingIntervals.has(printerId)) {
      clearInterval(this.pollingIntervals.get(printerId));
    }

    const intervalMs = (pollInterval || 300) * 1000; // Convert to milliseconds

    const interval = setInterval(async () => {
      try {
        await this.pollPrinter(integration);
      } catch (error) {
        console.error(`Error polling printer ${printerId}:`, error);
      }
    }, intervalMs);

    this.pollingIntervals.set(printerId, interval);
    console.log(`Started polling for printer ${printerId} every ${pollInterval}s`);

    await this.pollPrinter(integration);
  }

  private async pollPrinter(integration: any) {
    const { printerId, printer } = integration;

    try {
      const connector = createConnector(integration);

      const [status, jobHistory] = await Promise.all([
        connector.getStatus(),
        connector.getJobHistory(),
      ]);

      status.printerId = printerId;
      await this.integrationService.updatePrinterStatus(printerId, {
        status: status.status,
        tonerLevels: status.tonerLevels,
        paperLevels: status.paperLevels,
        errorMessages: status.errorMessages,
        jobQueue: status.jobQueue,
        totalPagesMonth: status.totalPagesMonth,
      });

      for (const job of jobHistory) {
        try {
          await this.integrationService.captureJob({
            printerId,
            externalJobId: job.jobId,
            fileName: job.fileName,
            pages: job.pages,
            copies: job.copies,
            isColor: job.isColor,
            paperSize: job.paperSize,
            paperType: job.paperType,
            quality: job.quality,
            metadata: job.metadata || {},
          });

          console.log(`Captured job ${job.jobId} from printer ${printer.name}`);
        } catch (captureError) {
          const errorMessage = captureError instanceof Error ? captureError.message : String(captureError);
          if (!errorMessage.includes('Unique constraint')) {
            console.error(`Error capturing job ${job.jobId}:`, captureError);
          }
        }
      }

      await this.integrationService.updateLastSync(integration.id);

    } catch (error) {
      console.error(`Failed to poll printer ${printer.name} (${printerId}):`, error);
      
      await this.integrationService.updatePrinterStatus(printerId, {
        status: 'ERROR',
        errorMessages: [`Polling failed: ${error instanceof Error ? error.message : String(error)}`],
      });
    }
  }

  async addPrinterToPolling(integrationId: string) {
    try {
      const integration = await prisma.printerIntegration.findUnique({
        where: { id: integrationId },
        include: { printer: true },
      });

      if (!integration || !integration.isActive) {
        console.log(`Integration ${integrationId} not found or inactive`);
        return;
      }

      await this.startPrinterPolling(integration);
    } catch (error) {
      console.error(`Error adding printer to polling:`, error);
    }
  }

  async removePrinterFromPolling(printerId: string) {
    if (this.pollingIntervals.has(printerId)) {
      clearInterval(this.pollingIntervals.get(printerId));
      this.pollingIntervals.delete(printerId);
      console.log(`Removed printer ${printerId} from polling`);
    }
  }

  getPollingStatus() {
    return {
      isRunning: this.isRunning,
      activePrinters: Array.from(this.pollingIntervals.keys()),
      totalActivePrinters: this.pollingIntervals.size,
    };
  }
}

export class WebhookService {
  private integrationService: PrinterIntegrationService;

  constructor() {
    this.integrationService = new PrinterIntegrationService();
  }

  async processWebhook(printerId: string, webhookData: any) {
    try {
      if (webhookData.type === 'job_completed' && webhookData.job) {
        const job = webhookData.job;
        
        const capture = await this.integrationService.captureJob({
          printerId,
          externalJobId: job.id,
          fileName: job.fileName || job.name,
          pages: job.pages || 1,
          copies: job.copies || 1,
          isColor: job.isColor || false,
          paperSize: job.paperSize || 'A4',
          paperType: job.paperType || 'Plain',
          quality: job.quality || 'Normal',
          metadata: {
            webhook: true,
            source: webhookData.source || 'unknown',
            timestamp: webhookData.timestamp || new Date().toISOString(),
          },
        });

        console.log(`Webhook: Captured job ${job.id} from printer ${printerId}`);
        return capture;
      }

      if (webhookData.type === 'status_update' && webhookData.status) {
        const status = webhookData.status;
        
        const updatedPrinter = await this.integrationService.updatePrinterStatus(printerId, {
          status: status.status || 'UNKNOWN',
          tonerLevels: status.toner,
          paperLevels: status.paper,
          errorMessages: status.errors,
          jobQueue: status.queueSize,
          totalPagesMonth: status.monthlyTotal,
        });

        console.log(`Webhook: Updated status for printer ${printerId}`);
        return updatedPrinter;
      }

      console.log(`Unknown webhook type: ${webhookData.type}`);
      return null;
    } catch (error) {
      console.error(`Webhook processing error for printer ${printerId}:`, error);
      throw error;
    }
  }

  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }
}

let pollingServiceInstance: PrinterPollingService | null = null;

export function getPollingService(): PrinterPollingService {
  if (!pollingServiceInstance) {
    pollingServiceInstance = PrinterPollingService.getInstance();
  }
  return pollingServiceInstance;
}

export function startPollingService() {
  const service = getPollingService();
  return service.startPolling();
}

export function stopPollingService() {
  const service = getPollingService();
  return service.stopPolling();
}