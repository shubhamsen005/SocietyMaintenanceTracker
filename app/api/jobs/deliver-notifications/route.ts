import { NextResponse } from 'next/server';
import { deliverPendingNotifications } from '@/lib/email';

async function deliver(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.JOB_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ delivered: await deliverPendingNotifications() });
}

// Vercel Cron invokes configured paths with GET. POST remains available for
// authenticated manual retries.
export const GET = deliver;
export const POST = deliver;
