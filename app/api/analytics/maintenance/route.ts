import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiError } from '@/lib/http';

export async function GET() {
  try {
    const user = await requireSession('ADMIN');
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [assets, locations, feedback, resolved] = await Promise.all([
      db.complaint.groupBy({ by: ['assetId'], where: { societyId: user.societyId, createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { assetId: 'desc' } }, take: 5 }),
      db.complaint.groupBy({ by: ['building', 'floor'], where: { societyId: user.societyId, status: { not: 'RESOLVED' } }, _count: { _all: true } }),
      db.residentFeedback.count({ where: { resolved: false, complaint: { societyId: user.societyId, createdAt: { gte: since } } } }),
      db.complaint.count({ where: { societyId: user.societyId, status: 'RESOLVED', createdAt: { gte: since } } }),
    ]);
    const ids = assets.map(item => item.assetId).filter((id): id is string => Boolean(id));
    const assetDetails = await db.asset.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
    const names = new Map(assetDetails.map(asset => [asset.id, asset.name]));
    const reopenRate = resolved ? Math.round((feedback / resolved) * 100) : 0;
    return NextResponse.json({
      repeatedAssets: assets.map(item => ({ assetId: item.assetId, name: item.assetId ? names.get(item.assetId) || 'Unassigned' : 'Unassigned', complaints: item._count._all })),
      heatmap: locations.map(item => ({ building: item.building, floor: item.floor, count: item._count._all })),
      firstTimeFixRate: Math.max(0, 100 - reopenRate),
      reopenRate,
    });
  } catch (error) { return apiError(error); }
}
