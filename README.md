# Project KEYSTONE
### Field Service Management Platform — Zidio Development Internship

A full-stack platform for managing field service operations for commercial facilities:
work orders, technician dispatch, SLA tracking, parts/time tracking, and a client
self-service portal.

**Stack:** Spring Boot 3 (Java 21) · React 18 + TypeScript · PostgreSQL · JWT Auth

---

## 1. Architecture

```
project-keystone/
├── backend/     Spring Boot REST API (port 8080)
├── frontend/    React + TypeScript SPA (port 5173, proxies /api to backend)
└── database/    schema.sql — sample seed data
```

### Roles
| Role | Capabilities |
|---|---|
| **Admin** | Full access: manage clients/sites/parts, all work orders, dashboards |
| **Dispatcher** | Dispatch board, assign technicians, manage work orders, clients/sites/parts |
| **Technician** | View/update assigned jobs, change status, log time & parts used |
| **Client** | Self-service portal: submit requests, track own organization's tickets |

### Work Order Lifecycle
```
NEW → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED
              ↕ ON_HOLD
     (any non-terminal state) → CANCELLED
```
SLA due-by timestamps are computed automatically from priority at creation:
`LOW=72h · MEDIUM=24h · HIGH=8h · CRITICAL=2h`. Orders are flagged `slaBreached`
if closed/resolved after their due time, or currently overdue if still open.

---

## 2. Backend Setup

### Prerequisites
- Java 21 (JDK)
- Maven 3.9+
- PostgreSQL 14+

### Steps
```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE keystone_db;"

# 2. Configure credentials (if different from defaults)
# edit backend/src/main/resources/application.properties
#   spring.datasource.username / spring.datasource.password

# 3. Run the app (Hibernate auto-creates tables on first run)
cd backend
mvn spring-boot:run

# 4. Load sample data (after first successful startup)
psql -U postgres -d keystone_db -f ../database/schema.sql
```
API will be live at `http://localhost:8080/api`.

### Key backend design notes
- **JWT auth** — stateless, `Authorization: Bearer <token>` header, 24h expiry.
- **Role-aware endpoints** — `GET /api/work-orders` returns different result sets
  depending on caller role (Admin/Dispatcher see all; Client sees only their org's
  orders; Technician sees only their assigned orders) — enforced server-side, not
  just hidden in the UI.
- **State machine** — status transitions are validated in `WorkOrderService.validateTransition()`;
  invalid transitions return HTTP 409.
- **SLA calculation** — `Priority` enum carries its own SLA window; due date is set
  once at creation and checked against `LocalDateTime.now()` on every status change.

---

## 3. Frontend Setup

### Prerequisites
- Node.js 18+

### Steps
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173` and proxies `/api/*` requests to the backend
on port 8080 (see `vite.config.ts`).

### Production build
```bash
npm run build      # outputs to frontend/dist
npm run preview    # preview the production build locally
```

---

## 4. Demo Logins

After loading `database/schema.sql`, these accounts are available
(password for all: **Password123!**):

| Email | Role |
|---|---|
| admin@keystone.dev | Admin |
| dispatcher@keystone.dev | Dispatcher |
| tech@keystone.dev | Technician |
| client@keystone.dev | Client (linked to Meridian Facilities Management) |

You can also register new accounts via the "Register" page. New Client accounts
need a valid `Client Organization ID` (the seeded Meridian org is ID `1`).

---

## 5. API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET/POST | `/api/work-orders` | All roles (role-filtered) / Admin,Dispatcher,Client |
| GET | `/api/work-orders/{id}` | All roles |
| PATCH | `/api/work-orders/{id}/assign` | Admin, Dispatcher |
| PATCH | `/api/work-orders/{id}/status` | Admin, Dispatcher, Technician |
| GET/POST | `/api/work-orders/{id}/parts` | Admin, Dispatcher, Technician |
| GET | `/api/work-orders/{id}/timelogs` | Admin, Dispatcher, Technician |
| GET | `/api/work-orders/{id}/timer/active/{technicianId}` | Admin, Dispatcher, Technician |
| POST | `/api/work-orders/{id}/timer/start/{technicianId}` | Admin, Dispatcher, Technician |
| POST | `/api/work-orders/timer/{timeLogId}/stop` | Admin, Dispatcher, Technician |
| POST | `/api/work-orders/{id}/notes` | All roles |
| GET | `/api/dashboard/stats` | Admin, Dispatcher |
| GET/POST | `/api/clients` | Admin, Dispatcher |
| GET/POST | `/api/sites` | Admin, Dispatcher (GET open to all) |
| GET/POST | `/api/parts` | Admin, Dispatcher |
| GET | `/api/technicians/available` | Admin, Dispatcher |

---

## 6. Known Limitations / Suggested Next Steps

These were out of scope for the current build but are natural next steps:

- **No file/photo attachments** on work orders (e.g. before/after repair photos).
- **No email/SMS notifications** on assignment or SLA breach — currently in-app only.
- **No refresh tokens** — JWT simply expires after 24h and the user must re-login.
- **No automated tests** (unit/integration) included yet — recommended before
  production use, especially around `WorkOrderService` status transitions.
- **Client site self-registration** isn't available — only Admin/Dispatcher can
  create sites today, so a brand-new client's first site must be added by staff.
- **Low-stock reordering isn't automated** — `/api/parts/low-stock` flags parts at
  or below their reorder threshold, but there's no purchase-order workflow, just
  visibility on the Parts Inventory page.

---

## 7. Academic Submission Notes

Built as a 4-week Java Full-Stack Engineering internship project for
**Zidio Development**, client brief: Meridian Facilities Management.
Deliverable: field service management platform (work orders, dispatch, SLA
compliance, parts/time tracking, dashboards, customer self-service portal).
