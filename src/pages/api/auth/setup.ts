import type { APIRoute } from 'astro';
import { getAdminUserCount, createAdminUser, createSession } from '../../../lib/auth';
import { logActivity } from '../../../lib/content';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  try {
    const adminCount = getAdminUserCount();
    if (adminCount > 0) {
      return new Response(JSON.stringify({ error: 'Setup is closed. An administrator account already exists.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { username, email, password, name } = body;

    if (!username || !email || !password || !name) {
      return new Response(JSON.stringify({ error: 'All fields (name, username, email, password) are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await createAdminUser(username, email, password, name);
    const ip = clientAddress || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || undefined;

    createSession(user.id, cookies, userAgent, ip);
    logActivity(user.id, 'SETUP', 'admin_user', user.id, `Created primary administrator "${user.username}"`);

    return new Response(JSON.stringify({ success: true, user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Setup initialization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
