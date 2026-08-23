import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';

const types = new Set(['image/jpeg','image/png','image/webp']);
const limit = Number(process.env.UPLOAD_MAX_MB || 5) * 1024 * 1024;
export async function POST(request:Request){try{const user=await requireSession();const form=await request.formData();const complaintId=String(form.get('complaintId')||'');const file=form.get('file');if(!(file instanceof File)||!complaintId)throw new Error('INVALID_UPLOAD');if(!types.has(file.type)||file.size>limit)return NextResponse.json({error:'INVALID_UPLOAD'},{status:400});const complaint=await db.complaint.findFirst({where:{id:complaintId,societyId:user.societyId,...(user.role==='RESIDENT'?{reporterId:user.id}:{})}});if(!complaint)throw new Error('NOT_FOUND');const bytes=Buffer.from(await file.arrayBuffer());const signatures:{[key:string]:number[]}={'image/jpeg':[0xff,0xd8,0xff],'image/png':[0x89,0x50,0x4e,0x47]};const sig=signatures[file.type];const signatureValid=file.type==='image/webp'?bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP':sig.every((value,index)=>bytes[index]===value);if(!signatureValid)return NextResponse.json({error:'INVALID_FILE_CONTENT'},{status:400});const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');let key:string;if(process.env.CLOUDINARY_URL){const uploaded=await new Promise<{public_id:string}>((resolve,reject)=>cloudinary.uploader.upload_stream({folder:'nivasa-pulse',resource_type:'image',public_id:randomUUID(),overwrite:false},(error,result)=>error||!result?reject(error):resolve(result)).end(bytes));key=`cloudinary:${uploaded.public_id}`;}else{const dir=path.join(process.cwd(),'uploads');await mkdir(dir,{recursive:true});key=`${randomUUID()}-${safeName}`;await writeFile(path.join(dir,key),bytes);}const photo=await db.complaintPhoto.create({data:{complaintId,storageKey:key,mimeType:file.type,bytes:file.size}});return NextResponse.json(photo,{status:201});}catch(error){return apiError(error)}}
