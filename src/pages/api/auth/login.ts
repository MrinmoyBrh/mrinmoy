import type { APIRoute } from 'astro';
import { authenticateAdmin, createSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: 'Please enter both username/email and password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ip = clientAddress || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await authenticateAdmin(identifier, password, ip);

    if (result.error || !result.user) {
      return new Response(JSON.stringify({ error: result.error || 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    createSession(result.user.id, cookies, userAgent, ip);

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Server authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
