import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthMiddleware } from '@/lib/auth-middleware';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'MANAGER'],
  });

  if (!authResult.success) {
    const authResponse = AuthMiddleware.createAuthResponse(authResult);
    if (authResponse) return authResponse;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const where: any = {};
    
    if (authResult.user?.role !== 'ADMIN') {
      where.userId = authResult.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    const tokens = await prisma.apiToken.findMany({
      where,
      select: {
        id: true,
        name: true,
        token: true, // In production, you might want to hide this or show only partial
        expiresAt: true,
        lastUsed: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Hide token for security (show only last 8 characters)
    const safeTokens = tokens.map(token => ({
      ...token,
      token: `****${token.token.slice(-8)}`,
    }));

    return NextResponse.json(safeTokens);
  } catch (error) {
    console.error('Error fetching API tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'MANAGER'],
  });

  if (!authResult.success) {
    const authResponse = AuthMiddleware.createAuthResponse(authResult);
    if (authResponse) return authResponse;
  }

  try {
    const body = await request.json();
    
    const { name, expiresInDays = 365, userId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    let targetUserId = authResult.user.id;

    if (userId && authResult.user.role === 'ADMIN') {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'Target user not found' },
          { status: 404 }
        );
      }

      targetUserId = userId;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const apiToken = await prisma.apiToken.create({
      data: {
        token,
        name,
        userId: targetUserId,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...apiToken,
        token, // Return full token only on creation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await AuthMiddleware.authenticate(request, {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'MANAGER'],
  });

  if (!authResult.success) {
    const authResponse = AuthMiddleware.createAuthResponse(authResult);
    if (authResponse) return authResponse;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    const existingToken = await prisma.apiToken.findUnique({
      where: { id: tokenId },
      include: { user: true },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Users can only delete their own tokens, admins can delete any
    if (
      authResult.user.role !== 'ADMIN' &&
      existingToken.userId !== authResult.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.apiToken.delete({
      where: { id: tokenId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}