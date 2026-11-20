import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, getAdminUserCount } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const method = context.request.method.toUpperCase();

  // 1. Initial Setup Guard
  if (pathname === '/admin/setup' || pathname === '/api/auth/setup') {
    const adminCount = await getAdminUserCount();
    if (adminCount > 0) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Setup is locked. An administrator already exists.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }
  }

  // 2. CSRF Defense for mutating API requests (POST, PUT, DELETE, PATCH)
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // Exclude public endpoints if any (all currently mutating endpoints are admin/auth)
    const origin = context.request.headers.get('origin');
    const referer = context.request.headers.get('referer');
    const host = context.request.headers.get('host');

    if (origin || referer) {
      const sourceUrl = origin || referer;
      try {
        const parsedSource = new URL(sourceUrl!);
        if (host && !parsedSource.host.toLowerCase().includes(host.toLowerCase())) {
          return new Response(JSON.stringify({ error: 'Cross-Site Request Forgery (CSRF) check failed: Untrusted Origin.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Malformed Origin/Referer header.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  // 3. Centralized API Guard for all /api/cms/* mutating routes
  if (pathname.startsWith('/api/cms') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const user = await getSessionUser(context.cookies);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Administrative authentication required.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 4. Centralized Admin Page Guard for /admin/* (except login & setup)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/setup') {
    const user = await getSessionUser(context.cookies);
    if (!user) {
      return context.redirect('/admin/login');
    }
  }

  // Execute route handler
  const response = await next();

  // 5. Cache-Control Security for Admin & CMS API routes (never cache sensitive data)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/cms') || pathname.startsWith('/api/auth')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // 6. Enterprise HTTP Security Headers (applied to all responses)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self'",
      "frame-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
});
