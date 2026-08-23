import { NextResponse } from 'next/server';
import { currentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(){try{const user=await currentSession();if(!user)throw new Error('UNAUTHENTICATED');const items=await db.asset.findMany({where:{societyId:user.societyId},include:{_count:{select:{complaints:true}}},orderBy:{name:'asc'}});return NextResponse.json({items});}catch(error){return apiError(error)}}
