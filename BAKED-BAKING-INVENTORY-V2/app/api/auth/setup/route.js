import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { createSessionToken, hashPassword, SESSION_COOKIE, sessionCookieOptions } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const configured = await prisma.teamMember.count({ where:{passwordHash:{not:null}} });
    if (configured) return Response.json({ error:'Admin setup has already been completed.' }, { status:409 });

    const d = await req.json();
    const email = String(d.email || '').trim().toLowerCase();
    const name = String(d.name || '').trim();
    if (!email || !name) throw new Error('Name and email are required.');
    const passwordHash = hashPassword(d.password);

    const user = await prisma.teamMember.upsert({
      where:{email},
      update:{name, role:'ADMIN', active:true, passwordHash, lastLoginAt:new Date()},
      create:{name, email, role:'ADMIN', active:true, passwordHash, lastLoginAt:new Date()}
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
    return Response.json({ok:true});
  } catch (e) {
    return Response.json({ error:e.message || 'Setup failed.' }, { status:400 });
  }
}
