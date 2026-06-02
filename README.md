# Traceability Platform

Next.js supply chain traceability POC with strict TypeScript, mock swap-ready API routes, shadcn/ui, and Joi validation.

## Getting started

See [docs/SETUP.md](./docs/SETUP.md) and [docs/POC_PHASES.md](./docs/POC_PHASES.md).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Login: `john@example.com` / `SuperAdmin123!`

## Current phase

**FR-4 Actors**, **FR-6 Supply Chains**, **FR-5/FR-7 Batches & Allocations**, and **FR-8 Events** — actors at `/actors`; wizard at `/supply-chains`; detail with allocations + event timeline; farm detail at `/farms/[farmId]`.

## License

Private — all rights reserved.
