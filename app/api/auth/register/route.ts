import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';
const input=z.object({name:z.string().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(100),inviteCode:z.string().min(8).max(40)});
export async function POST(request:Request){try{const body=input.parse(await request.json());const invite=await db.invite.findUnique({where:{code:body.inviteCode.toUpperCase()}});if(!invite||invite.usedAt||invite.expiresAt<=new Date())return NextResponse.json({error:'INVALID_OR_EXPIRED_INVITE'},{status:400});const exists=await db.user.findUnique({where:{email:body.email.toLowerCase()}});if(exists)return NextResponse.json({error:'EMAIL_IN_USE'},{status:409});const user=await db.$transaction(async tx=>{const created=await tx.user.create({data:{societyId:invite.societyId,name:body.name,email:body.email.toLowerCase(),passwordHash:await bcrypt.hash(body.password,12),unit:invite.unit}});await tx.invite.update({where:{id:invite.id},data:{usedAt:new Date(),usedById:created.id}});return created;});return NextResponse.json({id:user.id,email:user.email,unit:user.unit},{status:201});}catch(error){return apiError(error)}}
