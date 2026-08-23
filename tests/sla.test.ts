import test from 'node:test';
import assert from 'node:assert/strict';
import { dueAt, slaSnapshot } from '../lib/sla';

test('high-priority complaints default to a 12-hour SLA', () => {
  const opened = new Date('2026-08-22T00:00:00.000Z');
  assert.equal(dueAt(opened, 'HIGH').toISOString(), '2026-08-22T12:00:00.000Z');
});
test('SLA snapshot identifies overdue work without a persisted boolean', () => {
  const opened = new Date('2026-08-20T00:00:00.000Z');
  const due = new Date('2026-08-21T00:00:00.000Z');
  const snapshot = slaSnapshot(opened, due, new Date('2026-08-21T03:00:00.000Z'));
  assert.equal(snapshot.isOverdue, true);
  assert.equal(snapshot.overdueMs, 3 * 60 * 60 * 1000);
});
