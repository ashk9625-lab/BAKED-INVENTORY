import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

export const SESSION_COOKIE = 'baked_session';
const SESSION_HOURS = 8;

function secret() {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || 'baked-inventory-local-secret';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function hashPassword(password) {
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [kind, salt, expectedHex] = String(stored || '').split('$');
    if (kind !== 'scrypt' || !salt || !expectedHex) return false;
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token) {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return null;
    const expected = sign(payload);
    if (signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function currentUser() {
  const store = await cookies();
  const session = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session?.id) return null;
  const user = await prisma.teamMember.findUnique({ where: { id: Number(session.id) } });
  if (!user?.active || !user.passwordHash) return null;
  return user;
}

export async function requireUser(roles = []) {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (roles.length && !roles.includes(user.role)) redirect('/');
  return user;
}

export function canWrite(role) {
  return role !== 'VIEW_ONLY';
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_HOURS * 60 * 60
};
