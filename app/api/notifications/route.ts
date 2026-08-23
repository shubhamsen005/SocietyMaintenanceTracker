import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
export async function GET(){try{const user=await requireSession();const [items,unread]=await Promise.all([db.notification.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:30}),db.notification.count({where:{userId:user.id,status:'PENDING'}})]);return NextResponse.json({items,unread});}catch(error){return apiError(error)}}
