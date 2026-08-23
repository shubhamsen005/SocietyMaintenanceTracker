import { Priority } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
import { configuredSlaHours } from '@/lib/sla-config';
import { dueAt } from '@/lib/sla';

const input = z.object({ priority:z.nativeEnum(Priority), note:z.string().max(1000).optional() });
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const user = await requireSession('ADMIN');
    const { id } = await params;
    const body = input.parse(await request.json());
    const existing = await db.complaint.findFirst({where:{id,societyId:user.societyId}});
    if (!existing) throw new Error('NOT_FOUND');
    const thresholdHours = await configuredSlaHours(user.societyId, existing.category, body.priority);
    const complaint = await db.$transaction(async tx => {
      const updated = await tx.complaint.update({where:{id},data:{priority:body.priority,dueAt:dueAt(existing.openedAt,body.priority,thresholdHours)}});
      await tx.complaintHistory.create({data:{complaintId:id,actorId:user.id,eventType:'PRIORITY_CHANGED',note:body.note,metadata:{oldPriority:existing.priority,newPriority:body.priority,slaHours:thresholdHours ?? null}}});
      return updated;
    });
    return NextResponse.json(complaint);
  } catch (error) { return apiError(error); }
}
