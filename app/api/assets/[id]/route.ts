import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { currentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{const user=await currentSession();if(!user)throw new Error('UNAUTHENTICATED');const {id}=await params;const asset=await db.asset.findFirst({where:{id,societyId:user.societyId},include:{complaints:{orderBy:{createdAt:'desc'},take:20},_count:{select:{complaints:true}}}});if(!asset)throw new Error('NOT_FOUND');const url=`${process.env.NEXT_PUBLIC_APP_URL||new URL(request.url).origin}/report/asset/${asset.id}`;const qrDataUrl=await QRCode.toDataURL(url,{margin:1,width:300});return NextResponse.json({asset,reportUrl:url,qrDataUrl});}catch(error){return apiError(error)}}
