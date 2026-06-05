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

### Phase 12 — Deforestation: Farm entity update

- Extended farm model: **owner**, **status** workflow, **commodityIds[]** (multi-commodity), compliance fields
- Full CRUD via `/api/farms` and `/api/farms/[id]` with Joi validation
- **4-step create/edit wizard** (farm → owner → location → compliance) with **Skip for now** on optional steps
- Farms list: status badge, multi-commodity badges, commodity + **status** filters
- Farm detail: owner, status, commodities, production estimate, compliance flags, area (when set)
- Batches: optional **commodity** select when farm has 2+ commodities
- Supply chain wizard: farms filtered by `commodityIds.includes(commodityId)`
- Status enum: DRAFT → MAPPED → READY_FOR_ASSESSMENT → UNDER_REVIEW → ASSESSED → APPROVED → REJECTED (manual edit in POC)

### Phase 10 — FR-9 Traceability Visualization

- **Chain-of-custody graph** on `/supply-chains/[supplyChainId]` — interactive left-to-right flow
- Built client-side via `buildCustodyGraph()` from allocations, batches, farms, events, and actors (no new API)
- Node types: farm, batch, supply chain hub, lifecycle event (all 7 steps with completed/skipped/upcoming/next styling)
- React Flow (`@xyflow/react`) with pan/zoom controls; farm and actor nodes link to detail pages
- Legend for event step states; empty-allocation message when no batches assigned

### Phase 13 — Deforestation: FR-11 Farm Boundary

- `FarmBoundary` entity — polygon coordinates per farm with geodesic **area in hectares** (`@turf/area`)
- API: `GET/PUT/DELETE /api/farms/[id]/boundary` — mock store in `farm-boundaries.ts`
- Farm detail **Farm boundary** section — click-to-draw polygon on Leaflet/OSM map
- Draw UX: add corners → close shape → save; redraw and remove boundary supported
- Status rules: first save `DRAFT` → `MAPPED`; delete reverts `MAPPED` → `DRAFT`; syncs `farm.areaHectares`
- Seeded boundary on **Ashanti Cocoa Farm** (~4.91 ha, **ASSESSED** with demo assessment)

### Phase 14 — Deforestation: FR-12–15 Farm Assessment

- `FarmAssessment` entity — mock deforestation + protected-area analysis per farm boundary
- Risk levels: **LOW**, **MEDIUM**, **HIGH** (deterministic mock from farm id + boundary centroid)
- API: `GET/POST /api/farms/[id]/assessments`, `GET /api/farms/[id]/assessments/[assessmentId]`
- Mock store in `farm-assessments.ts`; engine in `run-mock-assessment.ts`
- Farm detail **Deforestation assessment** section — run assessment (requires boundary), latest result + history
- Status rules: successful run sets **DRAFT** / **MAPPED** / **READY_FOR_ASSESSMENT** → **ASSESSED**
- Seeded assessment on **Ashanti Cocoa Farm**

### Phase 15 — Deforestation: FR-16–17 Assessment Tab & Land-Cover Timeline

- Farm detail reorganized into **Overview**, **Deforestation**, and **Operations** tabs
- **Deforestation tab** — boundary map, run assessment, selected result, land-cover chart, full history table
- **Land-cover timeline** — mock satellite baseline (2020–2024) merged with assessment snapshots
- API: `GET /api/farms/[id]/land-cover-timeline`; builder in `build-land-cover-timeline.ts`
- Recharts line chart (forest cover + deforestation); selectable history rows highlight chart points
- Seeded **3 assessments** on Ashanti Cocoa Farm for demo history and timeline

### Phase 16 — Deforestation: FR-18 Chain-Level Risk Summary

- Aggregates latest farm assessment risk across farms linked via batch allocations
- Overall chain risk = highest assessed farm risk (**LOW** / **MEDIUM** / **HIGH**); **Unassessed** when no linked farm has an assessment
- API: `GET /api/supply-chains/[id]/risk-summary`; builder in `build-risk-summary.ts`
- Supply chain detail **Deforestation risk** card — overall badge + per-farm breakdown with links to farm detail
- Dashboard **At-risk chains** KPI and **Deforestation risk** column on ongoing supply chains table
- Seeded allocations: Ghana Cocoa → Ashanti (assessed), Sudan Gum → Kordofan (unassessed)

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
