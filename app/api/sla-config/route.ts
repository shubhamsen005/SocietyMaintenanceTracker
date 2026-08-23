import { Priority } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';

const input = z.object({
  category: z.string().min(2).max(50),
  priority: z.nativeEnum(Priority),
  thresholdHours: z.number().int().min(1).max(24 * 365),
});

export async function GET() {
  try {
    const user = await requireSession('ADMIN');
    const items = await db.sLAConfig.findMany({
      where: { societyId: user.societyId, category: { not: null }, priority: { not: null } },
      orderBy: [{ category: 'asc' }, { priority: 'asc' }],
    });
    return NextResponse.json({ items });
  } catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  try {
    const user = await requireSession('ADMIN');
    const body = input.parse(await request.json());
    const existing = await db.sLAConfig.findFirst({ where: { societyId: user.societyId, category: body.category, priority: body.priority } });
    const item = existing
      ? await db.sLAConfig.update({ where: { id: existing.id }, data: { thresholdHours: body.thresholdHours } })
      : await db.sLAConfig.create({ data: { societyId: user.societyId, ...body } });
    return NextResponse.json(item);
  } catch (error) { return apiError(error); }
}
