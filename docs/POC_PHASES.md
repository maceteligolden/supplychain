# Traceability Platform POC — Phase Roadmap

The POC is built **one functional requirement at a time**. Each phase adds mock API routes, services, types, and UI screens following the same swap-ready pattern.

## Completed

### Phase 1 — FR-1 Authentication

- Mock `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- httpOnly session cookie
- Login page, protected routes, app shell with Super Admin profile
- Placeholder dashboard

### Phase 3 — FR-2 Commodity Management

- Full CRUD via `/api/commodities` and `/api/commodities/[id]`
- Data table UI at `/commodities` with create/edit dialog and delete confirmation
- Pre-seeded **Cocoa** and **Gum Arabic** mock data
- File upload stub (local preview, mock imageUrl on save)
- Auto-generated commodity code from name (editable)
- Unit enum: KG, TON, LITRE, BAG, UNIT

## Upcoming (in order)

| Phase | Requirement                     | Key screens                          |
| ----- | ------------------------------- | ------------------------------------ |
| 2     | Dashboard KPIs                  | Real summary metrics from mock API   |
| 4     | FR-3 Farm Management            | Farms list/create, location          |
| 5     | FR-4 Actor Management           | Collection centres, processors, etc. |
| 6     | FR-5 Batch Management           | Harvest batches                      |
| 7     | FR-6 Supply Chain Management    | Supply chain journeys                |
| 8     | FR-7 Batch Allocation           | Allocate batches to chains           |
| 9     | FR-8 Event Management           | HARVEST, COLLECTION, EXPORT, etc.    |
| 10    | FR-9 Traceability Visualization | Chain-of-custody graph               |
| 11    | FR-10 Reporting                 | Traceability PDF reports             |

## Mock credentials (Phase 1)

| Email            | Password       | Role        |
| ---------------- | -------------- | ----------- |
| john@example.com | SuperAdmin123! | SUPER_ADMIN |

## Architecture rules

1. **UI** calls `src/services/*` only — never mock data or raw `fetch`
2. **URLs** from `src/config/page-routes.ts` and `src/config/api-routes.ts`
3. **Env** from `src/config/env.ts` only
4. **Mock data** in `src/mocks/data/` — consumed by API route handlers only
5. **Swap point** — edit API route handlers when MongoDB/real backend is ready
