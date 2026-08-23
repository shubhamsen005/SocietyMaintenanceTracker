import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(){try{const user=await requireSession('ADMIN');const now=new Date();const [byStatus,byCategory,overdue,critical]=await Promise.all([db.complaint.groupBy({by:['status'],where:{societyId:user.societyId},_count:{_all:true}}),db.complaint.groupBy({by:['category'],where:{societyId:user.societyId},_count:{_all:true}}),db.complaint.count({where:{societyId:user.societyId,status:{not:'RESOLVED'},dueAt:{lt:now}}}),db.incident.findMany({where:{societyId:user.societyId,status:{not:'RESOLVED'}},orderBy:{riskScore:'desc'},take:5})]);return NextResponse.json({byStatus,byCategory,overdue,attention:critical});}catch(error){return apiError(error)}}
