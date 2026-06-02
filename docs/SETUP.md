# SupplyChain — Project setup

Supply chain management frontend built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **Jotai**, and **Joi**.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick start

```bash
cd supplychain
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
├── app/              # Next.js App Router pages and layouts
├── components/       # UI components (ui/ = shadcn, feature folders)
├── lib/              # Shared utilities (logger, errors, validation)
└── store/            # Jotai atoms
design-tokens/        # Color tokens (source of truth)
tailwind.config.ts    # Tailwind theme extension
```

## TypeScript conventions

| Kind              | Suffix      | Example            |
| ----------------- | ----------- | ------------------ |
| Function args     | `Input`     | `CreateOrderInput` |
| Function returns  | `Output`    | `ListOrdersOutput` |
| Domain interfaces | `Interface` | `OrderInterface`   |
| Component props   | `Props`     | `OrderCardProps`   |

- No `any` — enforced by ESLint and `strict` TypeScript.
- Explicit return types on exported functions.

## Styling

- Colors defined in `design-tokens/colors.ts` and wired through `tailwind.config.ts`.
- Do not use Tailwind arbitrary values (`bg-[#fff]`, `w-[13px]`). ESLint flags these via `eslint-plugin-better-tailwindcss`.
- Use semantic tokens: `text-brand-primary-600`, `gap-section`, `max-w-content`.

## State management (Jotai)

Atoms live in `src/store/`. Wrap client components with `JotaiProvider` (already in root layout).

## Validation (Joi)

Define schemas in `src/lib/validation/` and validate via the shared `validate()` helper, which throws structured `AppError` instances.

## Error handling & logging

- `src/lib/errors.ts` — `createAppError`, `normalizeError`, `isAppError`
- `src/lib/logger.ts` — structured logger (replace with external service in production)
- `src/app/error.tsx` — global error UI
- `src/components/error-boundary.tsx` — client error boundary

## Git hooks (Husky + lint-staged)

- **pre-commit**: lint-staged runs ESLint + Prettier on staged files
- **pre-push**: full `npm run lint` and `npm run build` before any branch push

## Adding shadcn components

```bash
npx shadcn@latest add card input
```

Generated files land in `src/components/ui/`. shadcn files are ESLint-exempt for arbitrary Tailwind values used internally by the library.

## Cursor rules

Project conventions for AI assistants live in `.cursor/rules/supplychain.mdc`.
