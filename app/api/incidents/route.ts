import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(){try{const user=await requireSession('ADMIN');const items=await db.incident.findMany({where:{societyId:user.societyId},include:{links:{include:{complaint:{select:{displayId:true,description:true,status:true,reporter:{select:{name:true}}}}}}},orderBy:[{riskScore:'desc'},{updatedAt:'desc'}]});return NextResponse.json({items});}catch(error){return apiError(error)}}
