# HotelOne HMS — Grand Nusantara Hotel & Suites

Implementation of the `Hotel Program.dc.html` Claude Design prototype (see
`../README.md`, `../chats/chat1.md`) as a real Next.js app: Postgres +
Prisma data layer, NextAuth credentials login, and server actions instead
of client-only mock state.

## Screens (Menu Layar)

00 Login · 01 Cabang & Lokasi · 02 Front Desk (FD) Dashboard · 02A
Availability Grid · 02B Check-in Wizard · 02C Folio View · 02D Room Rack ·
02E Housekeeping · 02F POS Resto · 03 GM Dashboard.

Data flows for real between these: checking in a guest assigns a real
room and opens a real folio; housekeeping status changes update Room
Rack and the Check-in Wizard's room picker; POS "Charge to room" posts a
real folio transaction.

## Setup

Requires a local Postgres server (see `prisma/schema.prisma` for the
connection string shape in `.env`, copy from `.env.example`).

```bash
npm install
npx prisma migrate dev   # creates the schema
npm run db:seed          # realistic demo data (companies, rooms, guests, GM history)
npm run dev
```

Demo logins (seeded, password `rahasia123` for both):
- `rina.pratiwi@kantor.id` — Front Office → Front Desk Dashboard
- `hendra.wijaya@kantor.id` — Back Office → GM Dashboard

Re-run `npm run db:seed` (it resets the DB first via `prisma migrate
reset`, or just `npx tsx prisma/seed.ts` on an already-migrated DB) to
refresh "today"'s arrivals/departures — the seed pins them to the date
it's run on.

## Scope notes

- `prisma/schema.prisma` models the PRD's full data model (§10): the 10
  screens above are backed by real tables and mutations, while modules
  with no screen yet (CRM & Loyalty, MICE/Banquet, Inventory &
  Procurement, HR & Duty Roster, Accounting) get schema + minimal
  read-only routes under `app/api/v1/*` and a little seed data, per the
  brief's request to stub the rest of the PRD's module surface.
- GM Dashboard "vs LY" deltas: only per-department revenue has a stored
  last-year figure (`DepartmentRevenueDay.revenueLastYear`); the
  occupancy/ADR/RevPAR deltas reuse that same real revenue-growth ratio
  as a shared proxy rather than inventing independent numbers with no
  backing data (documented in `lib/gm.ts`).
- Pinned to Next.js 14.2.x / Prisma 5.22 / next-auth 4 (stable) rather
  than the `latest` tags, which resolved to pre-release majors with
  breaking changes during scaffolding.
