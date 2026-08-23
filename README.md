# 🏢 Nivasa Pulse — Society Maintenance Tracker

> **From individual complaints to community intelligence.**  
> Nivasa Pulse is a full-stack, enterprise-grade maintenance command center for apartment societies. It transforms scattered resident complaints into transparent, actionable maintenance incidents with real-time audit trails, SLA overdue detection, asset QR passports, notice board announcements, and automated email notifications.

---

## 🔗 Live Links & Repository

* **🚀 Live Hosted Application:** [https://nivasa-pulse.vercel.app](https://nivasa-pulse.vercel.app)
* **💻 GitHub Repository:** [https://github.com/shubhamsen005/SocietyMaintenanceTracker](https://github.com/shubhamsen005/SocietyMaintenanceTracker)

---

## ✨ Key Features & Capabilities

### 👤 **Resident Portal**
* **Self-Service Authentication:** Secure registration and login with role-based access control (RBAC).
* **Smart Complaint Intake:** Raise maintenance complaints with specific categories, building/floor/unit details, asset selection, and photo attachments.
* **Transparent Status History:** View personal complaints alongside an immutable step-by-step history log (Reported &rarr; In Progress &rarr; Resolved).
* **Reopening Feedback Loop:** Residents can verify resolution or reopen unresolved issues with one click.

### 🛡️ **Admin Command Center**
* **Centralized Operations Dashboard:** View society health score (0–100), complaint volume trends, active heatmap locations, and recent activity logs.
* **Triage & Priority Management:** Filter reports by category, status (`OPEN`, `IN_PROGRESS`, `RESOLVED`), date, or priority (`LOW`, `MEDIUM`, `HIGH`).
* **Audit-Logged Status Updates:** Every status change records the actor ID, timestamp, status transition, and optional resolution notes.
* **Automated Overdue Detection:** Configurable SLA thresholds (e.g. 12 hours for High Priority) flag overdue reports and surface them at the top of the admin grid.

### 📌 **Notice Board & Email Notifications**
* **Notice Board:** Admin can publish announcements and pin critical updates (`IMPORTANT · PINNED`).
* **Notification Engine:** Automated email notifications sent to residents upon complaint status changes and important notice announcements via Resend integration with an in-memory outbox logger.
* **Header Notification Menu:** Real-time bell popover displaying unread notifications, time ago badges, filter shortcuts, and "Mark all read" controls.

### 🏷️ **Asset Passports & QR Management**
* **QR-Ready Asset Surface:** Unique QR codes generated for every lift, pump, generator, and shared facility.
* **Printable QR Tags & Link Copy:** Admins can print physical QR tags or copy direct reporting links.
* **Interactive QR Scanner Simulator:** Test and simulate scanning physical QR tags directly within the application to launch instant asset intake forms.

---

## 🔑 Pre-Seeded Access Credentials

Run `npm run db:seed` to seed demo data. Use the following credentials to explore the system:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin (Facilities Manager)** | `admin@nivasa.pulse` | `nivasa2026` | Full command center, priority management, notice creation, asset QR tracking |
| **Resident** | `resident@nivasa.pulse` | `nivasa2026` | Resident dashboard, personal complaint history, notice board, feedback verification |

---

## 📐 System Architecture & Flowcharts

### 1. **High-Level System Architecture**

```mermaid
flowchart LR
  UI[Next.js 15 App Router UI] --> API[REST API / Route Handlers]
  API --> Auth[JWT Sessions + RBAC]
  API --> DB[(PostgreSQL Database via Prisma)]
  API --> Storage[Cloudinary / Binary Storage]
  API --> Outbox[Notification Outbox]
  Outbox --> Email[Resend API / Safe Local Logger]
  API --> Intelligence[Deterministic Incident Fusion & SLA Engine]
```

---

### 2. **Database Entity-Relationship Diagram (ERD)**

```mermaid
erDiagram
 USER ||--o{ COMPLAINT : "creates (Reporter)"
 SOCIETY ||--o{ BUILDING : "contains"
 BUILDING ||--o{ ASSET : "hosts"
 COMPLAINT }o--|| ASSET : "concerns"
 INCIDENT ||--o{ INCIDENT_COMPLAINT : "groups"
 COMPLAINT ||--o{ INCIDENT_COMPLAINT : "joins"
 COMPLAINT ||--o{ COMPLAINT_HISTORY : "records history"
 COMPLAINT ||--o{ COMPLAINT_PHOTO : "has uploaded photos"
 SOCIETY ||--o{ NOTICE : "publishes"
 USER ||--o{ NOTIFICATION : "receives"
 SOCIETY ||--o{ SLA_CONFIG : "configures"
```

---

### 3. **Complaint Lifecycle State Transition Diagram**

```mermaid
stateDiagram-v2
  [*] --> OPEN : Resident submits complaint (optional photo)
  OPEN --> IN_PROGRESS : Admin assigns vendor / begins work (history logged)
  OPEN --> OVERDUE : SLA threshold exceeded (surfaced to top of grid)
  OVERDUE --> IN_PROGRESS : Admin acts on overdue item
  IN_PROGRESS --> RESOLVED : Work completed with proof note (history logged)
  RESOLVED --> OPEN : Resident clicks "Still an issue" (reopened event)
  RESOLVED --> [*] : Resident confirms resolution / SLA window expires
```

---

## ⚙️ Environment Variables Reference

Copy `.env.example` to `.env.local` for local development:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nivasa_pulse?schema=public"

# Authentication Secret
AUTH_SECRET="super-secret-key-at-least-32-chars-long"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Integration (Resend API)
RESEND_API_KEY="re_123456789"
EMAIL_FROM="Nivasa Pulse <notifications@nivasa.pulse>"

# File Upload Storage (Cloudinary)
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
UPLOAD_MAX_MB=5
```

---

## 🛠️ Local Development Setup Guide

### 1. **Clone the Repository**
```bash
git clone https://github.com/shubhamsen005/SocietyMaintenanceTracker.git
cd SocietyMaintenanceTracker
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Database Migration & Seeding**
Ensure PostgreSQL is running locally or provide a remote `DATABASE_URL` in `.env.local`:
```bash
# Generate Prisma Client bindings
npm run db:generate

# Apply database migrations
npm run db:migrate

# Seed demo users, complaints, assets, and notices
npm run db:seed
```

### 4. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite covering session authentication, SLA overdue calculations, and Incident Fusion logic:

```bash
# Run unit & integration tests
npm test

# Run production build verification
npm run build
```

---

## 🔌 API Endpoint Reference

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user and sets session cookie |
| `/api/auth/register` | `POST` | Public | Registers a new resident user |
| `/api/complaints` | `GET` / `POST` | Authenticated | Fetches or creates complaints |
| `/api/complaints/[id]/status` | `PATCH` | Admin | Updates status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) & logs note |
| `/api/complaints/[id]/priority` | `PATCH` | Admin | Updates complaint priority (`LOW`, `MEDIUM`, `HIGH`) |
| `/api/complaints/[id]/feedback` | `POST` | Resident | Submits resident verification or reopening feedback |
| `/api/notices` | `GET` / `POST` | Admin/Resident | Reads or creates society notice announcements |
| `/api/notifications` | `GET` | Authenticated | Fetches user notifications and unread badge count |
| `/api/assets` | `GET` | Authenticated | Fetches all society assets with health scores |
| `/api/assets/[id]` | `GET` | Authenticated | Fetches asset details, passport URL, and QR data URL |
| `/api/dashboard/admin` | `GET` | Admin | Fetches administrative stats, status breakdowns, and overdue counts |
| `/api/sla-config` | `GET` / `PUT` | Admin | Lists and updates category/priority overdue thresholds |

---

## 📄 Documentation Directory

For deep technical specifications, design decisions, and database diagrams, see the [`docs/`](docs/) directory:

* 📑 [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) — Architectural system design write-up (complaint history, overdue engine, photo handling, and notification delivery).
* 📑 [docs/DATABASE.md](docs/DATABASE.md) — Comprehensive database schema description.
* 📑 [docs/API.md](docs/API.md) — Complete REST API specifications.
* 📑 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Vercel production deployment configuration guide.
* 📑 [docs/DECISIONS.md](docs/DECISIONS.md) — Architectural rationale & tradeoff decisions.
