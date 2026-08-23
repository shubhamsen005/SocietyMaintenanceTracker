import { NextResponse } from 'next/server';
import { ComplaintStatus } from '@prisma/client';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
import { queueComplaintUpdate } from '@/lib/notifications';
import { deliverPendingNotifications } from '@/lib/email';
const input=z.object({status:z.nativeEnum(ComplaintStatus),note:z.string().max(1000).optional(),resolutionNote:z.string().max(1000).optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{const user=await requireSession('ADMIN');const {id}=await params;const body=input.parse(await request.json());const previous=await db.complaint.findFirst({where:{id,societyId:user.societyId}});if(!previous)throw new Error('NOT_FOUND');const complaint=await db.$transaction(async tx=>{const updated=await tx.complaint.update({where:{id},data:{status:body.status,resolvedAt:body.status==='RESOLVED'?new Date():null,resolutionNote:body.resolutionNote}});await tx.complaintHistory.create({data:{complaintId:id,actorId:user.id,eventType:previous.status===body.status?'NOTE_ADDED':'STATUS_CHANGED',oldStatus:previous.status,newStatus:body.status,note:body.note}});return updated;});try { await queueComplaintUpdate(complaint.id,previous.reporterId,`STATUS_${body.status}`); } catch (notificationError) { console.error('Failed to queue notification', notificationError); }try { await deliverPendingNotifications(); } catch (deliveryError) { console.error('Notification delivery deferred', deliveryError); }return NextResponse.json(complaint);}catch(error){return apiError(error)}}
