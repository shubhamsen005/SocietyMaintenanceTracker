import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const user=await requireSession();const {id}=await params;const complaint=await db.complaint.findFirst({where:{id,societyId:user.societyId,...(user.role==='RESIDENT'?{reporterId:user.id}:{})},include:{asset:true,reporter:{select:{name:true}},histories:{include:{actor:{select:{name:true}}},orderBy:{createdAt:'asc'}},photos:true,incidentLinks:{include:{incident:true}}}});if(!complaint)throw new Error('NOT_FOUND');return NextResponse.json(complaint);}catch(error){return apiError(error)}}
