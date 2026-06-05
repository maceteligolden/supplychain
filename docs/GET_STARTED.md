# Traceability Platform — Get Started Guide

This guide is for **testers and operations users** evaluating the **deployed** Traceability Platform POC. It covers how to sign in, prepare master data, and run supply chain workflows in the hosted environment.

A **Word (.docx)** copy of this guide is available at [GET_STARTED.docx](./GET_STARTED.docx) (regenerate from this file with pandoc when the guide changes).

> **Note:** This guide assumes you are using a **deployed URL** shared by your project team—not a local install on your machine. Developers setting up the app locally should see [SETUP.md](./SETUP.md) instead.

---

## 1. Introduction

The **Traceability Platform** tracks agricultural produce from farm harvest through export and delivery. In this POC you can:

- Register **commodities**, **farms**, and **harvest batches**
- Manage **actors** (collection centres, processors, warehouses, exporters, carriers)
- Build **supply chains** that link farms and batch quantities to an export journey
- Record **lifecycle events** on each chain (harvest, collection, processing, and so on)
- View a **dashboard** with KPIs and ongoing chains
- **Export** traceability reports (PDF or CSV)

**Who can use it:** Super Admin (single role in this POC).

**Sidebar modules available today:**

| Module        | Route            | Purpose                                           |
| ------------- | ---------------- | ------------------------------------------------- |
| Dashboard     | `/`              | Overview, ongoing chains, recent activity, charts |
| Commodities   | `/commodities`   | Product types and units                           |
| Farms         | `/farms`         | Source farms linked to a commodity                |
| Actors        | `/actors`        | Organisations involved in the chain               |
| Supply Chains | `/supply-chains` | End-to-end traceability journeys                  |

---

## 2. Accessing the application

### Before you start

- Use a modern browser (Chrome, Edge, Firefox, or Safari).
- Open the **deployment URL** your team shared (for example `https://your-app.example.com`).
- Bookmark the URL so you can return to the same environment each session.
- If the link does not load, contact whoever provisioned the deployment—do not run `npm install` or start a local server unless you are a developer.

### Open the app

1. Paste the deployment URL into your browser’s address bar and press Enter.
2. If you are not signed in, you are redirected automatically to the **login** page (`/login` on the same host).

You do **not** need Node.js, npm, or any code on your computer to test the deployed app.

### Log in

1. Enter the **email** and **password** provided for your test environment.
2. Click **Sign in**.

**Default POC test account** (if your deployment was not given custom credentials):

| Email              | Password         |
| ------------------ | ---------------- |
| `john@example.com` | `SuperAdmin123!` |

If these credentials do not work, ask your administrator for the correct login for **your** deployment.

After a successful login you land on the **Dashboard** (home page of the app).

### Sign out

Use the **profile menu** in the top-right corner of the app shell and choose **Log out**.

Sign out when you finish a test session on a shared machine.

---

## 3. Before you work with supply chains

Complete these steps **in order** before creating or running a supply chain. Each step depends on the one before it.

| Step | Module              | Why it matters                                                                                        |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| 1    | **Commodities**     | Defines the product and unit (KG, TON, etc.). Farms and batches inherit the unit.                     |
| 2    | **Farms**           | Source locations; each farm links to one or more commodities and an owner.                            |
| 3    | **Harvest batches** | Records how much was harvested and is available to allocate.                                          |
| 4    | **Actors**          | Organisations required when recording lifecycle events. Only **ACTIVE** actors appear in event forms. |
| 5    | **Supply chains**   | Ties farms, batches, and events into one traceability journey.                                        |

### Explore with demo data first

The deployed environment includes **sample data** so you can explore without creating everything from scratch:

| Type          | Examples                                                                   |
| ------------- | -------------------------------------------------------------------------- |
| Commodities   | Cocoa, Gum Arabic                                                          |
| Farms         | Ashanti Cocoa Farm (Ghana), Kordofan Gum Farm (Sudan)                      |
| Supply chains | Ghana Cocoa Export Chain, Sudan Gum Arabic Export Chain                    |
| Actors        | Kumasi Collection Centre, Accra Cocoa Processing Ltd, Tema Export Terminal |

Ghana Cocoa Export Chain already has **Harvest** and **Collection** events linked to seeded actors.

---

### Step 1 — Commodities

**Go to:** Sidebar → **Commodities** (`/commodities`)

1. Click **Add commodity**.
2. Enter **name**, **code** (auto-generated from name; you can edit it), **unit**, and optionally an image.
3. Save. A success toast confirms the action.

**Units:** KG, TON, LITRE, BAG, UNIT.

---

### Step 2 — Farms

**Go to:** Sidebar → **Farms** (`/farms`)

1. Click **Add farm**.
2. **Step 1 — Farm:** enter **name**, **code**, and select one or more **commodities** (required).
3. **Step 2 — Owner:** enter owner contact details, or click **Skip for now**.
4. **Step 3 — Location:** enter country, region, city (GPS optional), or **Skip for now**.
5. **Step 4 — Compliance:** optional production estimate and compliance checkboxes, or **Skip for now**.
6. Click **Create farm**. New farms start in **Draft** status.

When **editing** a farm, step 4 includes a **status** dropdown (Super Admin can advance the workflow manually in this POC).

To open a farm’s detail page, click the farm **name** or choose **View farm** from the row menu. The detail page shows owner, status, commodities, and compliance flags.

---

### Step 3 — Harvest batches

**Go to:** Farm detail → **Batch management** tab (`/farms/[farmId]`)

1. Click **Add batch**.
2. If the farm grows **more than one commodity**, select which commodity this batch is for.
3. Enter **harvest date** and **quantity** (unit comes from the batch commodity).
4. Save.

Batch numbers are generated automatically (e.g. `BATCH_ASHANTI_COCOA_FARM_2025_001`).

**Batch status** updates as you allocate quantity:

- **CREATED** — nothing allocated yet
- **PARTIALLY_ALLOCATED** — some quantity assigned to supply chains
- **FULLY_ALLOCATED** — entire quantity assigned

---

### Step 4 — Actors

**Go to:** Sidebar → **Actors** (`/actors`)

1. Click **Add actor**.
2. Complete the **3-step wizard:**
   - **Organisation** — name, code, type (Collection Centre, Processor, Warehouse, Exporter, Carrier)
   - **Address** — line 1 (optional), city, region, country
   - **Status** — set to **ACTIVE** so the actor appears when recording events
3. Save.

Click an actor’s **name** to open their detail page (involvement stats, linked supply chains, event history).

---

### Step 5 — Allocate batches (optional before creating a chain)

You can assign batch quantity to a supply chain in either place:

- **Farm detail** → **Allocation management** tab — pick an **ACTIVE** supply chain and quantity
- **Supply chain wizard** (step 2) — when creating or editing a chain

Total allocated quantity for a batch cannot exceed the batch quantity.

---

## 4. Working with supply chains

### 4a. Create a supply chain

**Go to:** Sidebar → **Supply Chains** (`/supply-chains`) → **Add supply chain**

**Step 1 — Commodity and farms**

- Select a **commodity**.
- Use the farm **carousel** to select one or more farms (all must share that commodity).
- Click **Next**.

**Step 2 — Batch allocations**

- For each farm’s batches, enter the **quantity** to assign to this chain.
- Enter **0** to skip a batch.
- Click **Next**.

**Step 3 — Chain details**

- Enter **name**, **code**, **description** (optional), and **status**.
- Use **ACTIVE** if you need allocations and lifecycle events.
- Click **Create supply chain**.

---

### 4b. View and edit a supply chain

**List page** (`/supply-chains`):

- Search, filter by status, switch table/grid layout, paginate results.
- Click a chain **name** or **View chain** in the row menu to open detail.

**Detail page** (`/supply-chains/[supplyChainId]`):

- Summary stats: linked farms, allocated batches, total quantity, events recorded
- **Allocations** table: farm, batch, quantity
- **Event timeline**: lifecycle progress

To update a chain, click **Edit supply chain** to reopen the wizard (metadata and allocations sync together).

---

### 4c. Record lifecycle events

Events are recorded on the **supply chain detail** page, in the vertical **event timeline**.

**Lifecycle order:**

HARVEST → COLLECTION → PROCESSING → WAREHOUSING → EXPORT → IN_TRANSIT → DELIVERED

**Rules:**

| Rule           | Detail                                                             |
| -------------- | ------------------------------------------------------------------ |
| Forward only   | You cannot add an earlier step after a later one has been recorded |
| Skips allowed  | e.g. HARVEST then EXPORT is valid                                  |
| One per type   | Each event type can appear only once per chain                     |
| No delete      | Events cannot be removed                                           |
| Edit           | Notes and **actor** only — type and date are locked after creation |
| Actor required | Choose an **ACTIVE** actor when adding an event                    |

**To add an event:**

1. Open the supply chain detail page.
2. On the timeline, select the next allowed step.
3. Choose **actor**, **date/time**, and optional **notes**.
4. Save.

**To edit an event:** open the event on the timeline and update notes or actor.

---

### 4d. Chain-of-custody graph

On the supply chain detail page, scroll to **Chain of custody** (above the allocations table):

1. Open **Ghana Cocoa Export Chain** from **Supply Chains**.
2. The graph shows the supply chain hub connected to all seven lifecycle steps.
3. **Harvest** and **Collection** appear as completed (seeded demo events); remaining steps show as upcoming or next.
4. If batches are allocated, farm and batch nodes appear on the left with quantity labels on the edges.
5. Use pan/zoom controls on the map; click a **Farm** node to open farm detail.

---

### 4e. Export a traceability report

On the supply chain detail page:

1. Click **Export report**.
2. Choose **Download PDF** or **Download CSV spreadsheet**.

The report includes chain metadata, summary stats, allocations, and lifecycle events. The file downloads to your computer.

---

## 5. Dashboard quick reference

**Go to:** Sidebar → **Dashboard** (`/`)

| Section               | What you see                                                      |
| --------------------- | ----------------------------------------------------------------- |
| KPI cards             | Total farms, batches, active supply chains, events recorded       |
| Ongoing supply chains | Active chains not yet **Delivered** — click a name to open detail |
| Recent activity       | Latest lifecycle events across all chains                         |
| Charts                | Events by type; active chains by furthest lifecycle stage reached |

Use the dashboard for a quick health check before diving into individual modules.

---

## 6. Actor detail (optional)

**Go to:** **Actors** → click an actor **name**

The actor detail page shows:

- Profile (type, address, status)
- Stats: events recorded, supply chains involved
- Table of linked supply chains (with links to chain detail)
- Full **event history** for that actor

Useful when auditing which journeys an organisation has participated in.

---

## 7. Common tasks cheat sheet

| I want to…                   | Go to…                                                             | Then…                                 |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| Open the app                 | Deployment URL in your browser                                     | Sign in if prompted                   |
| Log in                       | Login page                                                         | Enter credentials → **Sign in**       |
| Add a new product type       | **Commodities**                                                    | **Add commodity**                     |
| Register a farm              | **Farms**                                                          | **Add farm**                          |
| Record a harvest             | **Farms** → farm name → **Batch management**                       | **Add batch**                         |
| Add a warehouse or exporter  | **Actors**                                                         | **Add actor** (set status **ACTIVE**) |
| Create an export journey     | **Supply Chains**                                                  | **Add supply chain** (3-step wizard)  |
| Assign produce to a chain    | **Supply Chains** wizard step 2, or farm **Allocation management** | Enter batch quantities                |
| Log collection or processing | **Supply Chains** → chain name → timeline                          | Add the next lifecycle event          |
| Download an audit report     | **Supply Chains** → chain name                                     | **Export report** → PDF or CSV        |
| See chains still in progress | **Dashboard**                                                      | **Ongoing supply chains** table       |
| See what an actor has done   | **Actors** → actor name                                            | Review involvement and event history  |

---

## 8. Tips and POC limitations

- **Shared test environment:** Other testers may use the same deployment. Changes you make (new farms, events, edits) are visible to everyone on that instance unless the environment is reset.
- **Data persistence:** Depends on how the deployment is hosted. If the server restarts or the environment is redeployed, data may reset to the seeded demo state. Confirm with your administrator if you need a stable dataset for a test cycle.
- **Single role:** Only Super Admin is available in this POC.
- **Toasts:** Green success and red error messages appear after create, update, and delete actions—use them to confirm each step during testing.
- **Inactive chains and actors:** **INACTIVE** supply chains do not accept new allocations; **INACTIVE** actors do not appear in event dropdowns.
- **Not built yet:** **Reports** and **Traceability** sidebar entries are placeholders for a future phase—use the **Chain of custody** graph and **Export report** on a supply chain detail page during UAT.
- **Exports:** PDF and CSV downloads save to your computer via the browser; no extra software is required.

---

## For developers only

Local installation, scripts, and architecture are documented in [SETUP.md](./SETUP.md). End users and UAT testers on a deployed build do not need that document.
