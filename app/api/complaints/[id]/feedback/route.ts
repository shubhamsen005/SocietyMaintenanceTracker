import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
const input=z.object({resolved:z.boolean(),note:z.string().max(1000).optional()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{const user=await requireSession();const {id}=await params;const body=input.parse(await request.json());const complaint=await db.complaint.findFirst({where:{id,societyId:user.societyId,reporterId:user.id}});if(!complaint)throw new Error('NOT_FOUND');await db.$transaction(async tx=>{await tx.residentFeedback.upsert({where:{complaintId:id},update:{resolved:body.resolved,note:body.note},create:{complaintId:id,resolved:body.resolved,note:body.note}});if(!body.resolved&&complaint.status==='RESOLVED'){await tx.complaint.update({where:{id},data:{status:'OPEN',resolvedAt:null}});await tx.complaintHistory.create({data:{complaintId:id,actorId:user.id,eventType:'REOPENED',oldStatus:'RESOLVED',newStatus:'OPEN',note:body.note||'Resident reported that the issue is still present.'}});}});return NextResponse.json({ok:true});}catch(error){return apiError(error)}}
