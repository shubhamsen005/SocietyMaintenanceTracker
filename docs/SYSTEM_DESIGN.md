# System Design

Nivasa Pulse separates a resident **Complaint** from an underlying **Incident**. This preserves each resident’s original report, ownership and communication trail while allowing operations staff to manage one real-world failure. `IncidentComplaint` is a join table rather than a destructive merge. A deterministic fusion service scores category, building, asset, token similarity and time proximity; it returns confidence and reasons. An optional AI adapter may enrich the result, but it is never required to submit or resolve work.

## Complaint history

Complaint status is `OPEN`, `IN_PROGRESS`, or `RESOLVED`. A status transition is transactional: it updates the complaint and appends an immutable `ComplaintHistory` record carrying old/new status, actor, timestamp, note and metadata. Priority, linking, split/merge, evidence and feedback also create append-only audit events. A resident selecting “still an issue” within a configured verification window creates a `REOPENED` event and returns the complaint to `OPEN`; old history is not edited.

## SLA and overdue detection

Admins configure thresholds by category and priority in workflow settings. At creation, the service resolves that SLA override (or a priority default) and stores `openedAt` and `dueAt`; priority changes recalculate the deadline and append an audit event. Queries calculate remaining time, percentage consumed and overdue duration from UTC timestamps instead of relying on a stale boolean. The indexed `(societyId, status, dueAt)` query powers overdue dashboard counts, and the admin worklist sorts unresolved overdue items first. Incident risk scores and matching reasons give administrators a transparent prioritization signal alongside the SLA deadline.

## Photo handling

The authenticated upload API validates an allow-list (JPEG, PNG, WebP), declared content type, file signature, configured size limit and complaint ownership. Production uploads stream to Cloudinary; local development uses an ignored `uploads/` directory. A `ComplaintPhoto` row records the complaint, opaque storage key, MIME type, byte count and purpose (`REPORTED` by default). The storage credential never reaches the client. Complaint creation and attachment upload are separate requests, so an attachment failure leaves the valid complaint intact and the UI reports that only the photo failed.

## Notifications

Status changes and important notices enqueue durable `Notification` rows with a unique recipient/type/entity idempotency key. The delivery worker reads pending rows, sends through Resend (or logs safely when no key is configured), and records attempts, sent time, failure status and error text. Delivery runs immediately on relevant actions when possible and is retried by an authenticated Vercel Cron endpoint. Email failure is isolated from complaint updates; in-app notifications remain visible with unread counts.

## Access and scaling

Credentials use bcrypt hashes and signed, HTTP-only session cookies. RBAC guards every admin mutation; residents can read only their complaints and incidents linked to their reports. Pagination, society-scoped indexes and aggregate queries keep dashboard work bounded. Uploads and notification delivery use external services in production. At scale, background workers can compute recurring-issue aggregates and cache dashboard snapshots while source-of-truth records remain in PostgreSQL.
