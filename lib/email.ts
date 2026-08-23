import { NotificationStatus } from '@prisma/client';
import { Resend } from 'resend';
import { db } from '@/lib/db';

export async function deliverPendingNotifications() {
  const pending = await db.notification.findMany({ where: { status: { in: ['PENDING', 'FAILED'] }, attempts: { lt: 5 } }, include: { user: true, complaint: true }, take: 25 });
  const client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  for (const notification of pending) {
    try {
      const recipient = process.env.RESEND_TEST_RECIPIENT || notification.user.email;
      const important = notification.type === 'IMPORTANT_NOTICE';
      const subject = important ? 'Important society notice from Nivasa Pulse' : `Update on ${notification.complaint?.displayId || 'your maintenance report'}`;
      const detail = important ? '<p>An important notice has been posted in your society notice board.</p>' : `<p>Your complaint status has been updated.</p>${notification.complaint ? `<p><strong>${notification.complaint.displayId}</strong></p>` : ''}`;
      if (client) {
        const result = await client.emails.send({ from: process.env.EMAIL_FROM || 'Nivasa Pulse <onboarding@resend.dev>', to: recipient, subject, html: `<p>Hello ${notification.user.name},</p>${detail}<p>Open Nivasa Pulse to view the full resolution trail.</p>` });
        if (result.error) throw new Error(result.error.message);
      } else console.info(`[email fallback] ${notification.type} → ${recipient}`);
      await db.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.SENT, sentAt: new Date(), attempts: { increment: 1 }, error: null } });
    } catch (error) {
      await db.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.FAILED, attempts: { increment: 1 }, error: error instanceof Error ? error.message.slice(0, 500) : 'Email provider failed' } });
    }
  }
  return pending.length;
}
