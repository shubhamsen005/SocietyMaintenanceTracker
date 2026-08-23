import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const [{ db }, { deliverPendingNotifications }] = await Promise.all([import('../lib/db'), import('../lib/email')]);
  const resident = await db.user.findUniqueOrThrow({ where: { email: 'resident@nivasa.pulse' } });
  const admin = await db.user.findUniqueOrThrow({ where: { email: 'admin@nivasa.pulse' } });
  const complaint = await db.complaint.findFirstOrThrow({ where: { societyId: resident.societyId }, orderBy: { createdAt: 'desc' } });
  const notice = await db.notice.create({ data: { societyId: resident.societyId, createdById: admin.id, title: 'Nivasa Pulse delivery test', content: 'This confirms important-notice email delivery is operational.', important: true } });
  await db.notification.upsert({ where: { idempotencyKey: `EMAIL_TEST_STATUS:${complaint.id}:${resident.id}` }, update: { status: 'PENDING', attempts: 0, error: null }, create: { userId: resident.id, complaintId: complaint.id, type: 'STATUS_RESOLVED', entityType: 'COMPLAINT', entityId: complaint.id, idempotencyKey: `EMAIL_TEST_STATUS:${complaint.id}:${resident.id}` } });
  await db.notification.upsert({ where: { idempotencyKey: `EMAIL_TEST_NOTICE:${notice.id}:${resident.id}` }, update: { status: 'PENDING', attempts: 0, error: null }, create: { userId: resident.id, type: 'IMPORTANT_NOTICE', entityType: 'NOTICE', entityId: notice.id, idempotencyKey: `EMAIL_TEST_NOTICE:${notice.id}:${resident.id}` } });
  const processed = await deliverPendingNotifications();
  const results = await db.notification.findMany({ where: { idempotencyKey: { in: [`EMAIL_TEST_STATUS:${complaint.id}:${resident.id}`, `EMAIL_TEST_NOTICE:${notice.id}:${resident.id}`] } }, select: { type: true, status: true, attempts: true, error: true } });
  console.log(JSON.stringify({ processed, results }));
}
main();
