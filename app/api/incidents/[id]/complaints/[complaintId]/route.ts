import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function DELETE(_:Request,{params}:{params:Promise<{id:string;complaintId:string}>}){try{const user=await requireSession('ADMIN');const {id,complaintId}=await params;const incident=await db.incident.findFirst({where:{id,societyId:user.societyId}});if(!incident)throw new Error('NOT_FOUND');await db.$transaction([db.incidentComplaint.delete({where:{incidentId_complaintId:{incidentId:id,complaintId}}}),db.complaintHistory.create({data:{complaintId,actorId:user.id,eventType:'INCIDENT_SPLIT',note:`Unlinked from ${incident.displayId}`,metadata:{incidentId:id}}})]);return NextResponse.json({ok:true});}catch(error){return apiError(error)}}
