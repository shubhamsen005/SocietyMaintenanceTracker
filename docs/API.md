# API contract

All endpoints return typed JSON and use the authenticated session; resident ownership is enforced server-side.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register resident; role is never client-assigned |
| POST | `/api/auth/login` | Create secure session |
| GET/POST | `/api/complaints` | Paginated resident/admin list; create complaint |
| GET | `/api/complaints/:id` | Detail with ownership checks |
| PATCH | `/api/complaints/:id/status` | Admin transition + immutable history/outbox |
| PATCH | `/api/complaints/:id/priority` | Admin priority change + audit event |
| GET | `/api/complaints/:id/history` | Append-only timeline |
| POST | `/api/uploads` | Authenticated complaint photo upload with ownership checks |
| GET | `/api/incidents` | Society incidents; residents see only incidents linked to their reports |
| POST | `/api/incidents/:id/attach-complaint` | Admin confirms Fusion link |
| GET | `/api/assets` | Asset passports |
| GET | `/api/dashboard/admin` | KPI and operational aggregates |
| GET | `/api/analytics/maintenance` | Recurrence, heatmap and health score |
| GET/POST | `/api/notices` | Pinned notices and admin creation |

The complaint list accepts `page`, `limit`, `status`, and `category`. Invalid payloads return `400`, unauthenticated requests `401`, forbidden operations `403`, and absent resources `404`.
