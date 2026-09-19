import micromatch from 'micromatch';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import env from './lib/env';
import { updateSession } from '@/lib/supabase/middleware';

// Constants for security headers
const SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
} as const;

// Generate CSP
const generateCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'img-src': [
      "'self'",
      'boxyhq.com',
      '*.boxyhq.com',
      '*.dicebear.com',
      'data:',
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      '*.gstatic.com',
      '*.google.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': [
      "'self'",
      '*.google.com',
      '*.gstatic.com',
      'boxyhq.com',
      '*.ingest.sentry.io',
      '*.mixpanel.com',
    ],
    'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .concat(['upgrade-insecure-requests'])
    .join('; ');
};

// Add routes that don't require authentication
const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/health',
  '/api/auth/**',
  '/api/invitations/*',
  '/auth/**',
  '/invitations/*',
  '/terms-condition',
  '/.well-known/*',
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass routes that don't require authentication
  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  const redirectUrl = new URL('/auth/login', req.url);
  redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));

  const { supabaseResponse, user } = await updateSession(req);

  if (!user) {
    return NextResponse.redirect(redirectUrl);
  }

  const csp = generateCSP();

  supabaseResponse.headers.set('Content-Security-Policy', csp);

  if (env.securityHeadersEnabled) {
    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      supabaseResponse.headers.set(key, value);
    });
  }

  // All good, let the request through
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$|api/auth/session).*)',
  ],
};
