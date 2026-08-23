import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPaths = ['/dashboard', '/resident', '/report/asset'];

function authSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET is required');
  return new TextEncoder().encode(value);
}

export async function middleware(request: NextRequest) {
  if (!protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) return NextResponse.next();
  const token = request.cookies.get('nivasa_session')?.value;
  if (!token) { const login = new URL('/login', request.url); login.searchParams.set('next', request.nextUrl.pathname); return NextResponse.redirect(login); }
  try {
    const payload = (await jwtVerify(token, authSecret())).payload as { role?: string };
    const residentRoute = request.nextUrl.pathname.startsWith('/resident');
    if ((residentRoute && payload.role !== 'RESIDENT') || (!residentRoute && payload.role !== 'ADMIN')) return NextResponse.redirect(new URL(payload.role === 'ADMIN' ? '/dashboard' : '/resident', request.url));
    return NextResponse.next();
  } catch { return NextResponse.redirect(new URL('/login', request.url)); }
}

export const config = { matcher: ['/dashboard/:path*', '/resident/:path*', '/report/asset/:path*'] };
