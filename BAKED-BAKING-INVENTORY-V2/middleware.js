import { NextResponse } from 'next/server';

const COOKIE = 'baked_session';

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verify(token) {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return null;
    const secret = process.env.AUTH_SECRET || process.env.DATABASE_URL || 'baked-inventory-local-secret';
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    if (b64url(new Uint8Array(sig)) !== signature) return null;
    const json = JSON.parse(new TextDecoder().decode(
      Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    ));
    if (!json.exp || Date.now() > json.exp) return null;
    return json;
  } catch {
    return null;
  }
}

function allowed(role, pathname, method) {
  if (pathname.startsWith('/api/purchase-orders') || pathname.startsWith('/purchase-orders')) return false;
  if (pathname.startsWith('/team') || pathname.startsWith('/api/team')) return role === 'ADMIN';
  if (method === 'GET' || method === 'HEAD') return true;
  if (pathname.startsWith('/api/suppliers')) return ['ADMIN','MANAGER'].includes(role);
  if (pathname.startsWith('/api/products')) return ['ADMIN','MANAGER'].includes(role);
  if (pathname.startsWith('/api/recipes')) return ['ADMIN','MANAGER'].includes(role);
  if (pathname.startsWith('/api/production')) return ['ADMIN','MANAGER','STAFF','PRODUCTION'].includes(role);
  if (pathname.startsWith('/api/stock-movements')) return ['ADMIN','MANAGER','STAFF','STOCK'].includes(role);
  if (pathname.startsWith('/api/transfers')) return ['ADMIN','MANAGER','STAFF','STOCK'].includes(role);
  return role !== 'VIEW_ONLY';
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const publicPath =
    pathname === '/login' ||
    pathname === '/setup' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/service-worker.js' ||
    pathname.startsWith('/icon-') ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/favicon.ico';

  if (publicPath) return NextResponse.next();

  const session = await verify(req.cookies.get(COOKIE)?.value);
  if (!session) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!allowed(session.role, pathname, req.method)) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'You do not have permission for this action.' }, { status: 403 });
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)']
};
