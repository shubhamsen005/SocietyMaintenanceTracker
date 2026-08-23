# Design decisions

**Explainable score over claimed ML.** There is not enough labelled society data to honestly train a reliable model. A deterministic weighted score is configurable, testable and exposes reasons. AI is an optional adapter for summarisation and matching only.

**Complaint and incident are separate.** A merge must never delete a resident’s original report. The join model supports following, split/merge correction, auditability and one-to-many notification updates.

**Outbox rather than direct email.** An email provider outage cannot roll back a legitimate status change. Idempotency keys make retried important-notice and status emails safe.

**One deployable boundary.** Next.js plus PostgreSQL keeps the internship project simple to operate while allowing strongly separated domain, repository and adapter modules.
