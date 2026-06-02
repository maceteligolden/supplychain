# Traceability Platform POC — Phase Roadmap

The POC is built **one functional requirement at a time**. Each phase adds mock API routes, services, types, and UI screens following the same swap-ready pattern.

## Completed

### Phase 1 — FR-1 Authentication

- Mock `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- httpOnly session cookie
- Login page, protected routes, app shell with Super Admin profile

### Phase 2 — Dashboard KPIs

- `GET /api/dashboard/summary` — computed from live mock stores
- Home page at `/` with real KPIs (farms, batches, active chains, events)
- Ongoing supply chains table with quick links to chain detail
- Recent activity feed (latest lifecycle events)
- Bar charts: events by type, active chain progress breakdown

### Phase 3 — FR-2 Commodity Management

- Full CRUD via `/api/commodities` and `/api/commodities/[id]`
- Data table UI at `/commodities` with create/edit dialog and delete confirmation
- Pre-seeded **Cocoa** and **Gum Arabic** mock data
- File upload stub (local preview, mock imageUrl on save)
- Auto-generated commodity code from name (editable)
- Unit enum: KG, TON, LITRE, BAG, UNIT
- List toolbar: search, filter, layout switcher, pagination, toast feedback

### Phase 4 — FR-3 Farm Management

- Full CRUD via `/api/farms` and `/api/farms/[id]`
- Farms list at `/farms` with search, commodity filter, table/grid layout, pagination
- Pre-seeded **Ashanti Cocoa Farm** and **Kordofan Gum Farm**
- Location fields: country, region, city, optional GPS coordinates
- Linked to commodities — farms require an existing commodity
- Auto-generated farm code from name (editable)
- Toast feedback on create, update, and delete

### Phase 5 — FR-6 Supply Chain Management

- Full CRUD via `/api/supply-chains` and `/api/supply-chains/[id]`
- **3-step wizard** (create + edit): commodity → farm carousel → batch allocations → chain details
- Supply chain detail at `/supply-chains/[supplyChainId]` — stats, allocation summary, event timeline
- Pre-seeded **Ghana Cocoa Export Chain** and **Sudan Gum Arabic Export Chain**
- Status enum: ACTIVE, INACTIVE (only ACTIVE chains accept allocations)
- Allocation sync via `PUT /api/supply-chains/[id]/allocations`

### Phase 6 — FR-5 Batch Management (farm-scoped)

- CRUD via `/api/batches` and `/api/batches/[id]` (filtered by `farmId`)
- Farm detail at `/farms/[farmId]` — stats + **Batch management** and **Allocation management** tabs
- Entry: **View farm** on farm rows, or click farm name
- Auto-generated batch numbers; commodity + unit derived from farm
- Pre-seeded one batch per seeded farm
- Batch delete blocked when allocations exist

### Phase 7 — FR-7 Batch Allocation (farm-scoped)

- CRUD via `/api/batch-allocations` and `/api/batch-allocations/[id]`
- **Allocations** tab on `/farms/[farmId]`
- Allocate batch quantity to active supply chains; over-allocation rejected
- Batch status auto-updates: CREATED → PARTIALLY_ALLOCATED → FULLY_ALLOCATED
- Supply chain delete blocked when referenced by allocations

### Phase 9 — FR-8 Event Management

- Chain-level lifecycle events on `/supply-chains/[supplyChainId]`
- Ordered types: HARVEST → COLLECTION → PROCESSING → WAREHOUSING → EXPORT → IN_TRANSIT → DELIVERED
- Forward-only serialization (skips allowed); no delete; notes and actor editable only
- Ecommerce-style vertical event timeline
- API: `GET/POST /api/supply-chains/[id]/events`, `PATCH /api/supply-chains/[id]/events/[eventId]`
- Pre-seeded HARVEST + COLLECTION on Ghana Cocoa Export Chain (linked to seeded actors)

### Phase 8 — FR-4 Actor Management

- Full CRUD via `/api/actors` and `/api/actors/[id]`
- Actors list at `/actors` with search, type/status filters, table/grid, pagination
- **Actor detail** at `/actors/[actorId]` — profile, involvement stats, linked supply chains, event history
- **3-step create/edit wizard** (organisation → address → status)
- Types: COLLECTION_CENTRE, PROCESSOR, WAREHOUSE, EXPORTER, CARRIER
- Pre-seeded Kumasi Collection Centre, Accra Cocoa Processing Ltd, Tema Export Terminal
- Events require an **ACTIVE** actor (`actorId`); delete blocked when referenced by events
- API: `GET /api/actors/[id]/involvement` — supply chains and events for an actor

### Phase 11 — FR-10 Reporting (partial)

- Traceability report export from supply chain detail — **PDF** or **CSV spreadsheet**
- `GET /api/supply-chains/[id]/report` — report JSON payload
- Client-side download via Export report menu on `/supply-chains/[supplyChainId]`

## Upcoming (in order)

| Phase | Requirement                     | Key screens            |
| ----- | ------------------------------- | ---------------------- |
| 10    | FR-9 Traceability Visualization | Chain-of-custody graph |

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
