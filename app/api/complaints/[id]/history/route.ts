import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const user=await requireSession();const {id}=await params;const complaint=await db.complaint.findFirst({where:{id,societyId:user.societyId,...(user.role==='RESIDENT'?{reporterId:user.id}:{})},select:{id:true}});if(!complaint)throw new Error('NOT_FOUND');const items=await db.complaintHistory.findMany({where:{complaintId:id},include:{actor:{select:{name:true,role:true}}},orderBy:{createdAt:'asc'}});return NextResponse.json({items});}catch(error){return apiError(error)}}
