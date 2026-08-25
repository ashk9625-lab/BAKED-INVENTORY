import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../../../../lib/auth';

export async function POST(req) {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { httpOnly:true, path:'/', maxAge:0 });
  return Response.redirect(new URL('/login', req.url), 303);
}
