import { NextResponse } from 'next/server';

export function middleware(request) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Return structured 503 response for API routes during maintenance
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          message: 'Decision Ledger is currently undergoing scheduled system maintenance.',
          statusCode: 503,
        },
        { status: 503 }
      );
    }

    // Rewrite all web page routes to /maintenance
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!maintenance|_next/static|_next/image|favicon.ico|icons|css).*)',
};
