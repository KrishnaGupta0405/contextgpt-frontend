import { NextResponse } from 'next/server';

// The only host that should ever be indexed.
const CANONICAL_HOST = 'contextgpt.co';

export function middleware(request) {
  const response = NextResponse.next();
  const host = request.headers.get('host') || '';

  // Vercel preview/branch deployments (and any other non-canonical host)
  // serve identical content, which search engines treat as duplicates.
  // Tell crawlers to drop them entirely — robots.txt cannot do this
  // because it is a single file shared by every host.
  const isCanonical = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;

  if (!isCanonical) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
