import { Role } from '@prisma/client';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const cookieName = 'nivasa_session';
export type Session = { id: string; societyId: string; role: Role; name: string };

function authSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET is required');
  return new TextEncoder().encode(value);
}

export async function createSession(user: Session) {
  return new SignJWT(user).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(authSecret());
}
export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, authSecret())).payload as unknown as Session; } catch { return null; }
}
export async function requireSession(role?: Role) {
  const session = await currentSession();
  if (!session) throw new Error('UNAUTHENTICATED');
  if (role && session.role !== role) throw new Error('FORBIDDEN');
  return session;
}
export const sessionCookie = (token: string) => ({ name: cookieName, value: token, httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
