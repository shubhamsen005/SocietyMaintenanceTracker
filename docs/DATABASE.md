# Database model

All timestamps are UTC. IDs are UUID internally; human display IDs are generated per society/year (for example `CMP-2026-00124`).

| Entity | Key fields |
|---|---|
| User | id, societyId, email (unique), passwordHash, role, unitId |
| Society / Building / Unit | tenancy and location hierarchy |
| Asset | id, societyId, code, location, QR token, healthScore, installedAt |
| Complaint | id, societyId, reporterId, assetId, category, status, priority, openedAt, dueAt |
| ComplaintHistory | id, complaintId, actorId, eventType, oldStatus, newStatus, note, createdAt |
| Incident / IncidentComplaint | incident state plus non-destructive complaint links and confidence/reason |
| ComplaintPhoto | complaintId, storageKey, checksum, purpose |
| Notice / Notification | pinned notices; idempotent delivery records |
| SLAConfig | society/category/priority thresholds |
| ResidentFeedback / AuditEvent | verification response and cross-domain append-only events |

Recommended indexes: `Complaint(societyId,status,dueAt)`, `Complaint(societyId,category,createdAt)`, `Complaint(assetId,createdAt)`, `Incident(societyId,status,riskScore)`, `ComplaintHistory(complaintId,createdAt)`, and unique `Notification(idempotencyKey)`.
