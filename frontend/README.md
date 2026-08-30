# Keystone — Frontend

A prototype-level React + Tailwind frontend for the Keystone field-service
management backend. Built to demo every endpoint listed in the spec, with
role-based views for `ADMIN`, `DISPATCHER`, `TECHNICIAN`, and `CLIENT`.

Kept deliberately simple — this is meant for a working demo, not a
polished production UI.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your hosted backend
npm run dev
```

Build for production:

```bash
npm run build
```

`VITE_API_URL` is the only place the backend URL is configured — the Axios
instance in `src/api/axios.js` reads it and prefixes every call with `/api`.

## Before your demo — check these field name assumptions

The spec didn't give exact DTO field names for a few endpoints, so this
project makes reasonable Spring Boot-style guesses. Test each of these
against your real backend and adjust if your DTOs differ:

| Area | File | Assumed fields |
|---|---|---|
| Register / Login | `src/api/authApi.js`, `AuthContext.jsx` | `fullName, email, password, role` -> response `token, role, userId, fullName` |
| Site | `src/api/siteApi.js`, `Sites.jsx` | `siteName, address, clientId` |
| Asset | `src/api/assetApi.js`, `Assets.jsx` | `assetName, model, serialNumber, siteId` |
| Work order create | `WorkOrderCreate.jsx` | `clientId, siteId, assetId, description, priority, dueDate` |
| Work order status | `WorkOrderDetails.jsx` | `status` values: `OPEN, ASSIGNED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED` |
| Assign technician | `WorkOrderDetails.jsx` | `{ technicianId }` |
| Add part | `WorkOrderDetails.jsx` | `{ partId, quantity }` |
| Technician availability | `Technicians.jsx` | `AVAILABLE, BUSY, UNAVAILABLE` |
| Timer / notes | `WorkOrderDetails.jsx` | `startTime, endTime, durationMinutes` / `content, authorName, createdAt` |

If a field name is wrong, the form/table still renders — just fix the key
name in the relevant `src/api/*.js` file or the page that reads the
response, and it flows through everywhere (each page consumes the shared
API layer, nothing is duplicated).

## What's implemented (maps to every endpoint in the spec)

- **Auth** - register, login, JWT stored + attached to every request,
  session restored on refresh, redirect to role home, 401 -> auto logout.
- **Clients** - list/search, view, create, edit, delete (admin only).
- **Sites** - list (filterable by client), create, delete.
- **Assets** - per-site list, create, delete.
- **Technicians** - list with availability control (admin/dispatcher see
  everyone; technicians see only their own record), "available" list used
  in the assign-technician flow.
- **Parts / inventory** - list, low-stock filter + dashboard widget,
  create, edit.
- **Dashboard** - renders whatever `/api/dashboard/stats` returns (no
  invented numbers), plus live low-stock and overdue widgets.
- **Work orders** - role-aware list (the same `GET /work-orders` call
  works for every role since the backend filters it), create with
  client -> site -> asset dependent selects, details page with:
  - status update, technician assignment
  - parts used + add part
  - time tracking: start/stop timer, live elapsed display reconstructed
    from the active-timer endpoint (survives refresh), time log table
  - notes thread
  - overdue list page.

## Structure

```
src/
  api/         one file per resource, all Axios calls live here
  context/     AuthContext (token, user, role, login/register/logout)
  components/  Layout (role-aware sidebar), route guards, shared UI (toast,
               badges, modal, confirm dialog, loading/empty/error states)
  pages/       one file per screen
```

## Known simplifications (intentional, for a prototype)

- No React Hook Form / Zod - plain controlled inputs with native
  `required` validation, to keep the code easy to read and adjust.
- Table filters (search/status/priority) are client-side.
- No skeleton loaders - a single shared `Loading` spinner.
