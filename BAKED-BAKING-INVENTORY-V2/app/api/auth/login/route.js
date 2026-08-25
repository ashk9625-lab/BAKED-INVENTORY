import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { createSessionToken, verifyPassword, SESSION_COOKIE, sessionCookieOptions } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const d = await req.json();
    const email = String(d.email || '').trim().toLowerCase();
    const user = await prisma.teamMember.findUnique({ where: { email } });
    if (!user?.active || !user.passwordHash || !verifyPassword(d.password, user.passwordHash)) {
      return Response.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }
    await prisma.teamMember.update({ where:{id:user.id}, data:{lastLoginAt:new Date()} });
    const store = await cookies();
    store.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
    return Response.json({ ok:true, name:user.name, role:user.role });
  } catch {
    return Response.json({ error: 'Login failed.' }, { status: 400 });
  }
}
