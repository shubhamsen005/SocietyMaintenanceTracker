import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession, sessionCookie } from '@/lib/auth';
import { apiError } from '@/lib/http';
const input = z.object({ email: z.string().email(), password: z.string().min(8) });
export async function POST(request: Request) { try { const {email,password}=input.parse(await request.json()); const user=await db.user.findUnique({where:{email:email.toLowerCase()}}); if (!user || !(await bcrypt.compare(password,user.passwordHash))) return NextResponse.json({error:'INVALID_CREDENTIALS'},{status:401}); const token=await createSession({id:user.id,societyId:user.societyId,role:user.role,name:user.name}); const response=NextResponse.json({user:{id:user.id,name:user.name,role:user.role}}); response.cookies.set(sessionCookie(token)); return response; } catch (error) { return apiError(error); } }
