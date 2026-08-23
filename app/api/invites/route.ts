import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
const input=z.object({unit:z.string().min(1).max(30),expiresInDays:z.number().int().min(1).max(30).default(7)});
export async function GET(){try{const user=await requireSession('ADMIN');const items=await db.invite.findMany({where:{societyId:user.societyId,usedAt:null,expiresAt:{gt:new Date()}},orderBy:{createdAt:'desc'}});return NextResponse.json({items});}catch(error){return apiError(error)}}
export async function POST(request:Request){try{const user=await requireSession('ADMIN');const body=input.parse(await request.json());const invite=await db.invite.create({data:{societyId:user.societyId,unit:body.unit,code:randomBytes(9).toString('base64url').toUpperCase(),expiresAt:new Date(Date.now()+body.expiresInDays*86400000)}});return NextResponse.json(invite,{status:201});}catch(error){return apiError(error)}}
