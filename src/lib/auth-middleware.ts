import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface AuthConfig {
  requireAuth?: boolean;
  allowedRoles?: ('ADMIN' | 'MANAGER' | 'USER')[];
  requirePrinterAccess?: boolean;
  allowApiKey?: boolean;
  allowWebhook?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  printer?: any;
  error?: string;
  statusCode?: number;
}

export class AuthMiddleware {
  static async authenticate(
    request: NextRequest,
    config: AuthConfig = {}
  ): Promise<AuthResult> {
    const {
      requireAuth = true,
      allowedRoles = ['ADMIN', 'MANAGER', 'USER'],
      requirePrinterAccess = false,
      allowApiKey = true,
      allowWebhook = false,
    } = config;

    try {
      if (allowWebhook && request.headers.get('x-webhook-signature')) {
        return await this.validateWebhookAuth(request);
      }

      if (allowApiKey && request.headers.get('x-api-key')) {
        return await this.validateApiKeyAuth(request, allowedRoles);
      }

      if (requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            success: false,
            error: 'Missing or invalid authorization header',
            statusCode: 401,
          };
        }

        const token = authHeader.substring(7);
        return await this.validateBearerToken(token, allowedRoles);
      }

      return { success: true };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Internal authentication error',
        statusCode: 500,
      };
    }
  }

  private static async validateWebhookAuth(request: NextRequest): Promise<AuthResult> {
    const printerId = request.headers.get('x-printer-id');
    
    if (!printerId) {
      return {
        success: false,
        error: 'Missing printer ID for webhook',
        statusCode: 400,
      };
    }

    const printer = await prisma.printer.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      return {
        success: false,
        error: 'Printer not found',
        statusCode: 404,
      };
    }

    return {
      success: true,
      printer,
    };
  }

  private static async validateApiKeyAuth(
    request: NextRequest,
    allowedRoles: string[]
  ): Promise<AuthResult> {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Missing API key',
        statusCode: 401,
      };
    }

    const apiToken = await prisma.apiToken.findUnique({
      where: { token: apiKey },
      include: { user: true },
    });

    if (!apiToken || apiToken.expiresAt < new Date()) {
      return {
        success: false,
        error: 'Invalid or expired API key',
        statusCode: 401,
      };
    }

    if (!allowedRoles.includes(apiToken.user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        statusCode: 403,
      };
    }

    return {
      success: true,
      user: apiToken.user,
    };
  }

  private static async validateBearerToken(
    token: string,
    allowedRoles: string[]
  ): Promise<AuthResult> {
    try {
      const decoded = await this.verifyJwtToken(token);
      
      if (!decoded || !decoded.sub) {
        return {
          success: false,
          error: 'Invalid token',
          statusCode: 401,
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          statusCode: 401,
        };
      }

      if (!allowedRoles.includes(user.role)) {
        return {
          success: false,
          error: 'Insufficient permissions',
          statusCode: 403,
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Token validation failed',
        statusCode: 401,
      };
    }
  }

  private static async verifyJwtToken(token: string): Promise<any> {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  static async validatePrinterAccess(
    userId: string,
    printerId: string
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const printer = await prisma.printer.findUnique({
        where: { id: printerId },
      });

      if (!user || !printer) {
        return false;
      }

      if (user.role === 'ADMIN') {
        return true;
      }

      if (user.role === 'MANAGER' && user.department === printer.department) {
        return true;
      }

      if (user.role === 'USER' && user.department === printer.department) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating printer access:', error);
      return false;
    }
  }

  static createAuthResponse(authResult: AuthResult): NextResponse | null {
    if (authResult.success) {
      return null;
    }

    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode || 500 }
    );
  }
}

export function withAuth(config: AuthConfig = {}) {
  return function (handler: Function) {
    return async function (request: NextRequest, ...args: any[]) {
      const authResult = await AuthMiddleware.authenticate(request, config);
      
      if (!authResult.success) {
        return AuthMiddleware.createAuthResponse(authResult);
      }

      (request as any).auth = {
        user: authResult.user,
        printer: authResult.printer,
      };

      return handler(request, ...args);
    };
  };
}

export async function checkAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN'],
    allowApiKey: true,
  });

  return AuthMiddleware.createAuthResponse(authResult);
}

export async function checkManagerAuth(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'MANAGER'],
    allowApiKey: true,
  });

  return AuthMiddleware.createAuthResponse(authResult);
}

export async function checkWebhookAuth(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: false,
    allowWebhook: true,
    allowApiKey: true,
  });

  return AuthMiddleware.createAuthResponse(authResult);
}