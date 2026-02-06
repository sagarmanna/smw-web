import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NEXT_PUBLIC_ENV,
      version: process.env.npm_package_version || '1.0.0',
      service: 'smw-web',
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'smw-web',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function HEAD() {
  // Simple HEAD request for basic health check
  return new NextResponse(null, { status: 200 });
}
