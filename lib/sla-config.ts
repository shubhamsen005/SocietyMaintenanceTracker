import { Priority } from '@prisma/client';
import { db } from '@/lib/db';

export async function configuredSlaHours(societyId: string, category: string, priority: Priority) {
  const config = await db.sLAConfig.findFirst({
    where: { societyId, category, priority },
    select: { thresholdHours: true },
  });
  return config?.thresholdHours;
}
