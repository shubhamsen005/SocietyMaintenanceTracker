import { NextResponse } from 'next/server';
import { deliverPendingNotifications } from '@/lib/email';
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.JOB_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  return NextResponse.json({ delivered: await deliverPendingNotifications() });
}
