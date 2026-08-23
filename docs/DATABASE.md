# Database model

All timestamps are UTC. Internal IDs use Prisma `cuid()` values; complaints and incidents also have human-readable display IDs (for example `CMP-2026-00124`).

| Entity | Key fields |
|---|---|
| User | id, societyId, email (unique), passwordHash, role, unit |
| Society / Building | tenancy and building hierarchy |
| Asset | id, societyId, code, location, QR token, healthScore, installedAt |
| Complaint | id, societyId, reporterId, assetId, category, status, priority, openedAt, dueAt |
| ComplaintHistory | id, complaintId, actorId, eventType, oldStatus, newStatus, note, createdAt |
| Incident / IncidentComplaint | incident state plus non-destructive complaint links and confidence/reason |
| ComplaintPhoto | complaintId, storageKey, mimeType, bytes, purpose |
| Notice / Notification | pinned notices; idempotent delivery records |
| SLAConfig | society/category/priority thresholds |
| ResidentFeedback | one resident verification response per complaint |

Recommended indexes: `Complaint(societyId,status,dueAt)`, `Complaint(societyId,category,createdAt)`, `Complaint(assetId,createdAt)`, `Incident(societyId,status,riskScore)`, `ComplaintHistory(complaintId,createdAt)`, and unique `Notification(idempotencyKey)`.
