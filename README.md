# SupplyChain

Next.js supply chain management platform with strict TypeScript, Tailwind design tokens, shadcn/ui, Jotai state, and Joi validation.

## Getting started

See [docs/SETUP.md](./docs/SETUP.md) for full project setup, conventions, and architecture.

```bash
npm install
npm run dev
```

## Key decisions

- **Type safety**: no `any`, explicit return types, `Input`/`Output`/`Interface`/`Props` naming suffixes
- **Styling**: colors and spacing in `design-tokens/` + `tailwind.config.ts`; no arbitrary Tailwind values in app code
- **Components**: shadcn/ui with JSDoc on components and interface fields
- **Quality gates**: Husky pre-commit (lint-staged) and pre-push (lint + build)

## License

Private — all rights reserved.
