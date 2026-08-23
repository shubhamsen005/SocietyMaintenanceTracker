import { db } from '@/lib/db';
export async function queueComplaintUpdate(complaintId:string, userId:string, event:string){ return db.notification.upsert({where:{idempotencyKey:`${event}:${complaintId}:${userId}`},update:{},create:{userId,complaintId,type:event,entityType:'COMPLAINT',entityId:complaintId,idempotencyKey:`${event}:${complaintId}:${userId}`}}); }
