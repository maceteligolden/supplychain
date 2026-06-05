# Traceability Platform — Project setup

Supply chain **traceability POC** frontend built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Jotai**, and **Joi**.

For **end-user instructions** (login, prerequisites, supply chains), see [GET_STARTED.md](./GET_STARTED.md).

For **Netlify deployment**, see [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md).

See [POC_PHASES.md](./POC_PHASES.md) for the sequential build roadmap.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick start

```bash
cd supplychain
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

**Mock Super Admin credentials:** `john@example.com` / `SuperAdmin123!`

## Scripts

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start development server      |
| `npm run build`     | Production build              |
| `npm run start`     | Serve production build        |
| `npm run lint`      | Run ESLint                    |
| `npm run lint:fix`  | Auto-fix ESLint issues        |
| `npm run format`    | Format with Prettier          |
| `npm run typecheck` | TypeScript check without emit |

## Architecture

```
src/
├── app/
│   ├── (ops)/          # Authenticated pages (dashboard, future modules)
│   ├── login/          # Public login page
│   └── api/            # Mock API routes (swap-ready for MongoDB)
├── config/             # env.ts, page-routes.ts, api-routes.ts (single source)
├── services/           # UI data entry point — never fetch directly in components
├── mocks/data/         # Mock data — API handlers only, never UI
├── types/              # Domain interfaces
├── components/         # Feature + layout + ui (shadcn)
├── lib/                # errors, logger, validation, auth, api helpers
└── store/              # Jotai atoms
```

## Mock UI & API architecture

Data flows: **Page → Service → `/api/*` route → mock data**. When MongoDB is connected, only API route handlers change.

| Config file                 | Purpose                            |
| --------------------------- | ---------------------------------- |
| `src/config/env.ts`         | Only file that reads `process.env` |
| `src/config/page-routes.ts` | All page/navigation paths          |
| `src/config/api-routes.ts`  | All API path constants             |

Auth uses httpOnly session cookies set by `POST /api/auth/login`. Middleware protects all routes except `/login`.

## Dashboard

Route: `/` (home after login).

| Section               | Description                                               |
| --------------------- | --------------------------------------------------------- |
| KPI cards             | Farms, batches, active supply chains, events recorded     |
| Ongoing supply chains | Active chains not yet delivered — links to chain detail   |
| Recent activity       | Latest lifecycle events across all chains                 |
| Charts                | Events by type; active chains by furthest lifecycle stage |

API route: `GET /api/dashboard/summary`.

## Commodity management (FR-2)

Route: `/commodities` (sidebar link when authenticated).

| Field | Description                                                      |
| ----- | ---------------------------------------------------------------- |
| Name  | Display name (e.g. Cocoa)                                        |
| Code  | Uppercase unique identifier — auto-generated from name, editable |
| Unit  | KG, TON, LITRE, BAG, or UNIT                                     |
| Image | Upload stub — local preview only; API stores a mock URL          |

Pre-seeded mock commodities: **Cocoa** (`COCOA`) and **Gum Arabic** (`GUM_ARABIC`).

List controls: search, unit filter, table/grid layout switcher, and client-side pagination (default 10 rows per page).

Action feedback: success and error toasts (Sonner) after create, update, or delete.

API routes: `GET/POST /api/commodities`, `GET/PATCH/DELETE /api/commodities/[id]`.

## Farm management (FR-3)

Route: `/farms` (sidebar link when authenticated).

**Create / edit wizard** (4 steps):

1. **Farm** — name, code, one or more commodities (required)
2. **Owner** — first name, last name, phone, email (optional — skip for now)
3. **Location** — country, region, city, optional GPS (optional — skip for now)
4. **Compliance** — annual production estimate, declaration accepted; **status** on edit only

| Field                      | Description                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Name                       | Display name (e.g. Ashanti Cocoa Farm)                                                                        |
| Code                       | Uppercase unique identifier — auto-generated from name, editable                                              |
| Commodities                | One or more linked commodities (`commodityIds[]`)                                                             |
| Status                     | DRAFT, MAPPED, READY_FOR_ASSESSMENT, UNDER_REVIEW, ASSESSED, APPROVED, REJECTED — defaults to DRAFT on create |
| Owner                      | firstName, lastName, phone, email — empty when skipped                                                        |
| Location                   | Country, region, city, optional latitude/longitude                                                            |
| Annual production estimate | Optional kg estimate                                                                                          |
| Declaration accepted       | Boolean compliance flag                                                                                       |
| Area (hectares)            | Computed from farm boundary polygon on save; shown on farm detail                                             |

Pre-seeded mock farms: **Ashanti Cocoa Farm** (Cocoa, Ghana) and **Kordofan Gum Farm** (Gum Arabic, Sudan).

List controls: search, commodity filter, **status filter**, table/grid layout switcher, client-side pagination, toast feedback.

API routes: `GET/POST /api/farms`, `GET/PATCH/DELETE /api/farms/[id]`.

## Farm boundary (FR-11)

On farm detail (`/farms/[farmId]`) — **Farm boundary** section between profile and batch overview.

| Action        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| Draw boundary | Click map corners (≥3 points) → **Close shape** → **Save boundary** |
| Redraw        | Replace existing polygon with a new draw session                    |
| Remove        | Deletes boundary; reverts **MAPPED** → **DRAFT** and clears area    |

- Map: Leaflet + OpenStreetMap tiles (no API key)
- Area computed server-side via Turf.js (geodesic hectares)
- First boundary save sets farm status to **MAPPED** when currently **DRAFT**

API routes: `GET/PUT/DELETE /api/farms/[id]/boundary`

Pre-seeded: **Ashanti Cocoa Farm** has a demo polygon (~4.91 ha) and **ASSESSED** status with a seeded assessment.

## Farm assessment (FR-12–15)

On farm detail (`/farms/[farmId]`) — **Deforestation assessment** section between boundary and batch overview.

| Action         | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Run assessment | Mock satellite analysis; requires a saved boundary polygon                         |
| Latest result  | Risk badge (Low / Medium / High), deforestation %, forest cover, protected overlap |
| History        | Previous assessment runs listed below the latest result                            |

- Assessment engine is deterministic mock data (no real satellite API)
- Successful run advances farm status to **ASSESSED** when currently **DRAFT**, **MAPPED**, or **READY_FOR_ASSESSMENT**

API routes: `GET/POST /api/farms/[id]/assessments`, `GET /api/farms/[id]/assessments/[assessmentId]`

Pre-seeded: **Ashanti Cocoa Farm** has three demo assessments and **Assessed** status.

## Farm detail tabs

Farm detail (`/farms/[farmId]`) uses three top-level tabs:

| Tab           | Contents                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| Overview      | Farm profile, batch overview stats                                                |
| Deforestation | Boundary map, run assessment, land-cover timeline chart, assessment history table |
| Operations    | Batch management and allocation management (nested tabs)                          |

## Land-cover timeline (FR-17)

On the **Deforestation** tab — chart of forest cover and deforestation over time.

| Feature       | Description                                                     |
| ------------- | --------------------------------------------------------------- |
| Baseline      | Mock satellite snapshots for 2020–2024 (deterministic per farm) |
| Assessments   | Each assessment run adds a snapshot point on the chart          |
| History table | Full metrics per run; click a row to highlight it on the chart  |

API route: `GET /api/farms/[id]/land-cover-timeline`

## Supply chain deforestation risk (FR-18)

Chain-level risk is derived from the **latest assessment** on each farm linked via batch allocations.

| Overall risk        | Rule                                           |
| ------------------- | ---------------------------------------------- |
| No farms linked     | Shown when the chain has no allocations        |
| Unassessed          | Linked farms exist but none have an assessment |
| Low / Medium / High | Highest risk among assessed linked farms       |

**Supply chain detail** (`/supply-chains/[supplyChainId]`) — **Deforestation risk** card below KPI stats: overall badge, per-farm table with allocated quantity and links to farm detail.

**Dashboard** — **At-risk chains** KPI (medium or high); **Deforestation risk** column on the ongoing supply chains table.

API route: `GET /api/supply-chains/[id]/risk-summary`

Pre-seeded allocations: **Ghana Cocoa Export Chain** → Ashanti (medium risk); **Sudan Gum Arabic Export Chain** → Kordofan (unassessed).

## Supply chain management (FR-6)

List route: `/supply-chains`. Detail route: `/supply-chains/[supplyChainId]`.

**Create / edit wizard** (3 steps):

1. Select commodity, then one or more farms (same commodity) via horizontal carousel
2. Allocate batch quantities per farm (0 = skip batch)
3. Enter chain name, code, description, status

| Field       | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| Name        | Display name (e.g. Ghana Cocoa Export Chain)                       |
| Code        | Uppercase unique identifier — auto-generated from name, editable   |
| Description | Optional route summary                                             |
| Status      | ACTIVE or INACTIVE — only ACTIVE chains accept allocations         |
| Commodity   | Set from wizard step 1; all source farms must share this commodity |

Pre-seeded: **Ghana Cocoa Export Chain** (`GH_COCOA_EXPORT`) and **Sudan Gum Arabic Export Chain** (`SD_GUM_EXPORT`).

API routes:

- `GET/POST /api/supply-chains` — POST accepts optional `commodityId` + `allocations[]`
- `GET/PATCH/DELETE /api/supply-chains/[id]`
- `PUT /api/supply-chains/[id]/allocations` — replace-all allocation sync
- `GET /api/batch-allocations?supplyChainId=` — list allocations by chain
- `GET /api/supply-chains/[id]/report` — traceability report JSON for export

Entry: **View chain** in row actions, click chain name, or open wizard via **Add supply chain** / **Edit**.

**Export report** (supply chain detail): **Export report** menu → Download PDF or Download CSV spreadsheet. Report includes chain metadata, stats, allocations, and lifecycle events.

**Chain of custody graph** (supply chain detail): interactive map from source farms and batches through the supply chain hub to each lifecycle event step. Event nodes use the same completed / skipped / upcoming / next states as the timeline. Pan and zoom with the on-map controls; click farm nodes to open farm detail, event subtitles link to actors.

## Event management (FR-8)

Embedded on `/supply-chains/[supplyChainId]` — vertical tracking timeline (ecommerce-style).

| Rule       | Description                                                                       |
| ---------- | --------------------------------------------------------------------------------- |
| Order      | HARVEST → COLLECTION → PROCESSING → WAREHOUSING → EXPORT → IN_TRANSIT → DELIVERED |
| Skips      | Allowed (e.g. HARVEST then EXPORT)                                                |
| Backwards  | Rejected — cannot add an earlier step after a later one                           |
| Duplicates | One event per type per chain                                                      |
| Delete     | Not allowed                                                                       |
| Edit       | Notes and actor only — type and `occurredAt` are locked                           |
| Actor      | Required on create — select from **ACTIVE** actors at `/actors`                   |

API routes: `GET/POST /api/supply-chains/[id]/events`, `PATCH /api/supply-chains/[id]/events/[eventId]`.

## Actor management (FR-4)

List route: `/actors`. Detail route: `/actors/[actorId]`.

Manage collection centres, processors, warehouses, exporters, and carriers.

| Field   | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| Name    | Organisation display name                                         |
| Code    | Uppercase unique identifier — auto-generated from name, editable  |
| Type    | COLLECTION_CENTRE, PROCESSOR, WAREHOUSE, EXPORTER, CARRIER        |
| Address | line1 (optional), city, region, country                           |
| Status  | ACTIVE or INACTIVE — only ACTIVE actors appear in event dropdowns |

**Create / edit wizard** (3 steps): organisation → address → status.

Pre-seeded: **Kumasi Collection Centre**, **Accra Cocoa Processing Ltd**, **Tema Export Terminal**.

Actor detail shows profile, events recorded, supply chains involved, event history, and linked chain table.

API routes: `GET/POST /api/actors`, `GET/PATCH/DELETE /api/actors/[id]`, `GET /api/actors/[id]/involvement`.

Entry: click actor name on `/actors`, or **Edit** from row actions.

Delete blocked when actor is referenced by supply chain events.

## Batch management & allocation (FR-5 + FR-7)

Farm detail page: `/farms/[farmId]` — farm metadata, batch stats, and **Batch management** / **Allocation management** tabs.

Entry: **View farm** in row actions, or click the farm name on `/farms`.

| Batch field  | Description                                               |
| ------------ | --------------------------------------------------------- |
| Batch number | Auto-generated (e.g. `BATCH_ASHANTI_COCOA_FARM_2025_001`) |
| Harvest date | YYYY-MM-DD                                                |
| Quantity     | Positive number; unit inherited from farm commodity       |
| Status       | CREATED, PARTIALLY_ALLOCATED, FULLY_ALLOCATED             |

Allocations assign batch quantity to an **ACTIVE** supply chain. Total allocated quantity cannot exceed batch quantity.

API routes: `GET/POST /api/batches`, `GET/PATCH/DELETE /api/batches/[id]`, `GET/POST /api/batch-allocations?farmId=`, `GET /api/batch-allocations?supplyChainId=`, `PATCH/DELETE /api/batch-allocations/[id]`.

## TypeScript conventions

| Kind              | Suffix      | Example          |
| ----------------- | ----------- | ---------------- |
| Function args     | `Input`     | `LoginInput`     |
| Function returns  | `Output`    | `LoginOutput`    |
| Domain interfaces | `Interface` | `UserInterface`  |
| Component props   | `Props`     | `LoginFormProps` |

## Git hooks (Husky + lint-staged)

- **pre-commit**: lint-staged (ESLint + Prettier on staged files)
- **pre-push**: full `npm run lint` and `npm run build`

## Cursor rules

Project conventions for AI assistants live in `.cursor/rules/supplychain.mdc`.
