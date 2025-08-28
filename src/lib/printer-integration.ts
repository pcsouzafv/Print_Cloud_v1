import { prisma } from './prisma';
import { PrinterIntegration, PrintJobCapture, PrinterStatus } from '@/types';

export class PrinterIntegrationService {
  async createIntegration(data: {
    printerId: string;
    type: 'SNMP' | 'HTTP' | 'IPP' | 'WSD';
    endpoint: string;
    authType: 'NONE' | 'BASIC' | 'API_KEY' | 'CERTIFICATE';
    credentials?: any;
    pollInterval?: number;
  }) {
    return await prisma.printerIntegration.create({
      data: {
        printerId: data.printerId,
        type: data.type,
        endpoint: data.endpoint,
        authType: data.authType,
        credentials: data.credentials,
        pollInterval: data.pollInterval || 300,
      },
    });
  }

  async getIntegration(printerId: string, type?: string) {
    const where: any = { printerId };
    if (type) where.type = type;

    return await prisma.printerIntegration.findFirst({
      where,
      include: { printer: true },
    });
  }

  async updateLastSync(integrationId: string) {
    return await prisma.printerIntegration.update({
      where: { id: integrationId },
      data: { lastSync: new Date() },
    });
  }

  async captureJob(data: {
    printerId: string;
    externalJobId: string;
    fileName: string;
    pages: number;
    copies: number;
    isColor: boolean;
    paperSize: string;
    paperType: string;
    quality: string;
    metadata?: any;
  }) {
    return await prisma.printJobCapture.create({
      data,
      include: { printer: true },
    });
  }

  async processCapture(captureId: string, userId?: string) {
    const capture = await prisma.printJobCapture.findUnique({
      where: { id: captureId },
      include: { printer: true },
    });

    if (!capture) throw new Error('Capture not found');

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { printQuotas: true },
      });

      if (user) {
        const quota = user.printQuotas[0];
        if (quota) {
          const totalPages = capture.pages * capture.copies;
          
          if (capture.isColor && quota.colorUsage + totalPages <= quota.colorLimit) {
            await this.createPrintJob(capture, userId);
          } else if (!capture.isColor && quota.currentUsage + totalPages <= quota.monthlyLimit) {
            await this.createPrintJob(capture, userId);
          } else {
            throw new Error('Quota exceeded');
          }
        }
      }
    }

    await prisma.printJobCapture.update({
      where: { id: captureId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        userId,
      },
    });
  }

  private async createPrintJob(capture: any, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { printQuotas: true },
    });

    if (!user) return;

    const printCost = await prisma.printCost.findUnique({
      where: { department: user.department },
    });

    const costPerPage = capture.isColor 
      ? (printCost?.colorPage || 0.15) 
      : (printCost?.blackAndWhitePage || 0.05);
    
    const totalPages = capture.pages * capture.copies;
    const totalCost = totalPages * costPerPage;

    const printJob = await prisma.printJob.create({
      data: {
        userId,
        printerId: capture.printerId,
        fileName: capture.fileName,
        pages: capture.pages,
        copies: capture.copies,
        isColor: capture.isColor,
        cost: totalCost,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    const quota = user.printQuotas[0];
    if (quota) {
      await prisma.printQuota.update({
        where: { userId },
        data: {
          currentUsage: capture.isColor 
            ? quota.currentUsage 
            : quota.currentUsage + totalPages,
          colorUsage: capture.isColor 
            ? quota.colorUsage + totalPages 
            : quota.colorUsage,
        },
      });
    }

    return printJob;
  }

  async updatePrinterStatus(printerId: string, statusData: {
    status: string;
    tonerLevels?: any;
    paperLevels?: any;
    errorMessages?: string[];
    jobQueue?: number;
    totalPagesMonth?: number;
  }) {
    await prisma.printerStatusHistory.create({
      data: {
        printerId,
        ...statusData,
      },
    });

    const printerStatus: any = { status: statusData.status };
    if (statusData.status === 'ERROR' || statusData.status === 'MAINTENANCE') {
      printerStatus.status = statusData.status;
    } else if (statusData.status === 'ONLINE') {
      printerStatus.status = 'ACTIVE';
    } else {
      printerStatus.status = 'INACTIVE';
    }

    return await prisma.printer.update({
      where: { id: printerId },
      data: printerStatus,
    });
  }

  async getPrinterStatus(printerId: string) {
    return await prisma.printerStatusHistory.findFirst({
      where: { printerId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getUnprocessedCaptures(printerId?: string) {
    const where: any = { status: 'CAPTURED' };
    if (printerId) where.printerId = printerId;

    return await prisma.printJobCapture.findMany({
      where,
      include: { printer: true },
      orderBy: { capturedAt: 'asc' },
    });
  }
}

export class SNMPConnector {
  private endpoint: string;
  private community: string;

  constructor(endpoint: string, community: string = 'public') {
    this.endpoint = endpoint;
    this.community = community;
  }

  async getStatus(): Promise<PrinterStatus> {
    const response = {
      printerId: '',
      status: 'ONLINE' as const,
      tonerLevels: {
        black: 85,
        cyan: 72,
        magenta: 68,
        yellow: 79,
      },
      paperLevels: {
        tray1: 100,
        tray2: 45,
      },
      jobQueue: 2,
      totalPagesMonth: 1247,
      lastUpdated: new Date(),
    };

    return response;
  }

  async getJobHistory(): Promise<any[]> {
    return [
      {
        jobId: 'SNMPJob001',
        fileName: 'document1.pdf',
        pages: 5,
        copies: 1,
        isColor: false,
        paperSize: 'A4',
        paperType: 'Plain',
        quality: 'Normal',
        timestamp: new Date(),
      },
    ];
  }
}

export class IPPConnector {
  private endpoint: string;
  private credentials?: { username: string; password: string };

  constructor(endpoint: string, credentials?: { username: string; password: string }) {
    this.endpoint = endpoint;
    this.credentials = credentials;
  }

  async getStatus(): Promise<PrinterStatus> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/ipp',
      };

      if (this.credentials) {
        const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
        headers.Authorization = `Basic ${auth}`;
      }

      const response = {
        printerId: '',
        status: 'ONLINE' as const,
        tonerLevels: {
          black: 90,
          cyan: 85,
          magenta: 75,
          yellow: 82,
        },
        paperLevels: {
          tray1: 95,
          tray2: 60,
        },
        jobQueue: 1,
        totalPagesMonth: 892,
        lastUpdated: new Date(),
      };

      return response;
    } catch (error) {
      throw new Error(`IPP connection failed: ${error}`);
    }
  }

  async getJobHistory(): Promise<any[]> {
    return [
      {
        jobId: 'IPPJob001',
        fileName: 'report.docx',
        pages: 12,
        copies: 2,
        isColor: true,
        paperSize: 'A4',
        paperType: 'Plain',
        quality: 'High',
        timestamp: new Date(),
      },
    ];
  }
}

export class HTTPConnector {
  private endpoint: string;
  private authType: string;
  private credentials?: any;

  constructor(endpoint: string, authType: string, credentials?: any) {
    this.endpoint = endpoint;
    this.authType = authType;
    this.credentials = credentials;
  }

  async getStatus(): Promise<PrinterStatus> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authType === 'BASIC' && this.credentials) {
        const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
        headers.Authorization = `Basic ${auth}`;
      } else if (this.authType === 'API_KEY' && this.credentials) {
        headers['X-API-Key'] = this.credentials.apiKey;
      }

      const response = await fetch(`${this.endpoint}/status`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        printerId: data.printerId || '',
        status: data.status || 'UNKNOWN',
        tonerLevels: data.toner,
        paperLevels: data.paper,
        errorMessages: data.errors,
        jobQueue: data.queueSize,
        totalPagesMonth: data.monthlyTotal,
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new Error(`HTTP connection failed: ${error}`);
    }
  }

  async getJobHistory(): Promise<any[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authType === 'BASIC' && this.credentials) {
        const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
        headers.Authorization = `Basic ${auth}`;
      } else if (this.authType === 'API_KEY' && this.credentials) {
        headers['X-API-Key'] = this.credentials.apiKey;
      }

      const response = await fetch(`${this.endpoint}/jobs`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`HTTP job history failed: ${error}`);
    }
  }
}

export function createConnector(integration: any) {
  const { type, endpoint, authType, credentials } = integration;

  switch (type) {
    case 'SNMP':
      return new SNMPConnector(endpoint, credentials?.community);
    case 'IPP':
      return new IPPConnector(endpoint, credentials);
    case 'HTTP':
      return new HTTPConnector(endpoint, authType, credentials);
    default:
      throw new Error(`Unsupported integration type: ${type}`);
  }
}