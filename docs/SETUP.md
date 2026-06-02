# Traceability Platform — Project setup

Supply chain **traceability POC** frontend built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Jotai**, and **Joi**.

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
