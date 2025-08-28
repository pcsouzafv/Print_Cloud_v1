export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  azureId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  location: string;
  ipAddress: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
  serialNumber: string;
  department: string;
  isColorPrinter: boolean;
  monthlyQuota: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintJob {
  id: string;
  userId: string;
  printerId: string;
  fileName: string;
  pages: number;
  copies: number;
  isColor: boolean;
  cost: number;
  status: 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  submittedAt: Date;
  completedAt?: Date;
}

export interface PrintQuota {
  id: string;
  userId: string;
  department: string;
  monthlyLimit: number;
  currentUsage: number;
  colorLimit: number;
  colorUsage: number;
  resetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  budget: number;
  monthlyQuota: number;
  colorQuota: number;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintCost {
  id: string;
  department: string;
  blackAndWhitePage: number;
  colorPage: number;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface PrinterIntegration {
  id: string;
  printerId: string;
  type: 'SNMP' | 'HTTP' | 'IPP' | 'WSD';
  endpoint: string;
  authType: 'NONE' | 'BASIC' | 'API_KEY' | 'CERTIFICATE';
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
    certificate?: string;
  };
  pollInterval: number;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintJobCapture {
  id: string;
  printerId: string;
  externalJobId: string;
  fileName: string;
  pages: number;
  copies: number;
  isColor: boolean;
  paperSize: string;
  paperType: string;
  quality: string;
  status: 'CAPTURED' | 'PROCESSED' | 'ERROR';
  capturedAt: Date;
  processedAt?: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PrinterStatus {
  printerId: string;
  status: 'ONLINE' | 'OFFLINE' | 'PRINTING' | 'ERROR' | 'WARNING';
  tonerLevels?: {
    black?: number;
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  paperLevels?: Record<string, number>;
  errorMessages?: string[];
  jobQueue?: number;
  totalPagesMonth?: number;
  lastUpdated: Date;
}