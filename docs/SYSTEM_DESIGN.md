# System Design

Nivasa Pulse separates a resident **Complaint** from an underlying **Incident**. This preserves each resident’s original report, ownership and communication trail while allowing operations staff to manage one real-world failure. `IncidentComplaint` is a join table rather than a destructive merge. A deterministic fusion service scores category, building, asset, token similarity and time proximity; it returns confidence and reasons. An optional AI adapter may enrich the result, but it is never required to submit or resolve work.

## Complaint history

Complaint status is `OPEN`, `IN_PROGRESS`, or `RESOLVED`. A status transition is transactional: it updates the complaint and appends an immutable `ComplaintHistory` record carrying old/new status, actor, timestamp, note and metadata. Priority, linking, split/merge, evidence and feedback also create append-only audit events. A resident selecting “still an issue” within a configured verification window creates a `REOPENED` event and returns the complaint to `OPEN`; old history is not edited.

## SLA and overdue detection

At creation, the service resolves a category/priority SLA override or a global default, storing `openedAt`, `thresholdHours` and `dueAt`. Queries calculate remaining time, percentage consumed and overdue duration from UTC timestamps; they do not rely on a stale boolean. Indexed scheduled queries identify overdue records and generate one idempotent escalation notification per breach. The risk service weights priority, SLA consumption, age, affected residents, recurrence, asset history and unresolved related incidents. Weights live in configuration and the UI shows the contributing reasons.

## Photo handling

The API validates an allow-list (JPEG, PNG, WebP), content type, file signature, size and ownership before storing uploads in object storage. It records a `ComplaintPhoto` row with a storage key, checksum and purpose (`REPORTED` or `RESOLUTION`). Clients receive short-lived URLs rather than a storage credential. Development can use a local adapter; production uses Cloudinary or Supabase Storage. Failed uploads never partially change complaint state.

## Notifications

Domain writes add notification rows/outbox jobs in the same transaction. A worker reads pending jobs, sends through Resend (or logs safely locally), then records attempts, provider ID, sent time and error metadata. A unique idempotency key on recipient/type/entity/event prevents duplicates on retries. Email failure is isolated from complaint updates; in-app notifications remain visible with unread counts.

## Access and scaling

Credentials use Argon2/bcrypt hashes and server-side sessions. RBAC guards every admin route; residents must own or follow a complaint to read it. Pagination, society-scoped composite indexes and aggregate queries prevent N+1 dashboard work. Uploads and notification delivery are asynchronous. At scale, background workers compute recurring-issue aggregates and cache dashboard snapshots, while source-of-truth events remain in PostgreSQL.
