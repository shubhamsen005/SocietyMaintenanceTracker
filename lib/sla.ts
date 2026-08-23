import { Priority } from '@prisma/client';
export const defaultSlaHours = 48;
export function dueAt(openedAt: Date, priority: Priority, configuredHours?: number) { return new Date(openedAt.getTime() + (configuredHours ?? (priority === 'HIGH' ? 12 : priority === 'MEDIUM' ? 48 : 72)) * 3600000); }
export function slaSnapshot(openedAt: Date, due: Date, now = new Date()) { const total=due.getTime()-openedAt.getTime(); const remaining=due.getTime()-now.getTime(); return { isOverdue: remaining < 0, remainingMs: Math.max(0,remaining), overdueMs: Math.max(0,-remaining), percentUsed: Math.max(0,Math.round(((now.getTime()-openedAt.getTime())/total)*100)) }; }
