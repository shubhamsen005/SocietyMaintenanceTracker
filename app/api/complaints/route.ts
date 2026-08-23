import { ComplaintStatus, Priority, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
import { configuredSlaHours } from '@/lib/sla-config';
import { dueAt } from '@/lib/sla';
import { scoreFusion } from '@/lib/fusion';

const createInput = z.object({ category:z.string().min(2).max(50), description:z.string().min(10).max(2000), building:z.string().min(1).max(60), floor:z.string().max(20).optional(), unit:z.string().max(30).optional(), assetId:z.string().optional(), priority:z.nativeEnum(Priority).optional() });

export async function GET(request: Request) {
  try {
    const user = await requireSession();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));
    const where: Prisma.ComplaintWhereInput = { societyId:user.societyId, ...(user.role === 'RESIDENT' ? { reporterId:user.id } : {}) };
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (status) where.status = z.nativeEnum(ComplaintStatus).parse(status);
    if (category) where.category = category;
    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) { const value = new Date(`${from}T00:00:00.000Z`); if (Number.isNaN(value.getTime())) throw new Error('INVALID_DATE'); createdAt.gte = value; }
      if (to) { const value = new Date(`${to}T23:59:59.999Z`); if (Number.isNaN(value.getTime())) throw new Error('INVALID_DATE'); createdAt.lte = value; }
      where.createdAt = createdAt;
    }
    const histories = { include:{actor:{select:{name:true,role:true}}}, orderBy:{createdAt:'asc' as const}, ...(user.role === 'ADMIN' ? {take:1} : {}) };
    const [items,total] = await Promise.all([
      db.complaint.findMany({ where, include:{ asset:true, reporter:{select:{name:true,email:true}}, histories }, orderBy:[{dueAt:'asc'},{createdAt:'desc'}], skip:(page-1)*limit, take:limit }),
      db.complaint.count({ where }),
    ]);
    return NextResponse.json({ items,total,page,limit });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    const body = createInput.parse(await request.json());
    if (body.assetId) { const asset = await db.asset.findFirst({where:{id:body.assetId,societyId:user.societyId}}); if (!asset) throw new Error('NOT_FOUND'); }
    const openedAt = new Date();
    const priority = body.priority ?? 'MEDIUM';
    const thresholdHours = await configuredSlaHours(user.societyId, body.category, priority);
    const number = await db.complaint.count({where:{societyId:user.societyId}}) + 1;
    const candidates = await db.complaint.findMany({where:{societyId:user.societyId,status:{not:'RESOLVED'},openedAt:{gt:new Date(openedAt.getTime()-48*3600000)}},take:25,orderBy:{openedAt:'desc'}});
    const complaint = await db.$transaction(async tx => {
      const created = await tx.complaint.create({data:{displayId:`CMP-${openedAt.getUTCFullYear()}-${String(number).padStart(5,'0')}`,societyId:user.societyId,reporterId:user.id,assetId:body.assetId,category:body.category,description:body.description,building:body.building,floor:body.floor,unit:body.unit,priority,openedAt,dueAt:dueAt(openedAt,priority,thresholdHours)}});
      await tx.complaintHistory.create({data:{complaintId:created.id,actorId:user.id,eventType:'CREATED',newStatus:'OPEN',note:'Complaint submitted by resident.',metadata:{slaHours:thresholdHours ?? null}}});
      return created;
    });
    const suggestion = candidates.map(candidate=>({complaintId:candidate.id,displayId:candidate.displayId,...scoreFusion({category:body.category,building:body.building,assetId:body.assetId,description:body.description,openedAt},{category:candidate.category,building:candidate.building,assetId:candidate.assetId,description:candidate.description,openedAt:candidate.openedAt})})).filter(match=>match.confidence>=45).sort((a,b)=>b.confidence-a.confidence)[0];
    return NextResponse.json({complaint,suggestion},{status:201});
  } catch (error) { return apiError(error); }
}
