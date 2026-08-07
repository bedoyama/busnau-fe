# busnau-fe

Next.js frontend for the [busnau-api](../busnau-api) task manager.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/LOCAL.md](./docs/LOCAL.md) | Run locally with **MSW mocks** or the **real backend** on the same machine |
| [docs/plan-v1.md](./docs/plan-v1.md) | FE roadmap (auth, tasks, admin) with dual-mode / mock checklist |

## Quick start (mock mode — default)

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

Mocks are **on by default in development**. No Java or Postgres required.

## Real backend (same machine)

1. Start API (`../busnau-api`) on `http://localhost:8080`.
2. Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

3. Restart `pnpm dev`.

See [docs/LOCAL.md](./docs/LOCAL.md) for CORS notes, env table, and regenerating mocks when the API changes.

## Scripts

```bash
pnpm dev            # Next dev server
pnpm build
pnpm lint
pnpm generate:api   # Orval from openapi/swagger.json → models + MSW
```

## Stack

- Next.js 16 / React 19
- ky HTTP client → `NEXT_PUBLIC_API_URL`
- MSW mock backend (Orval-generated handlers)
- React Query installed (wiring in plan Phase 4)
- Zod + Tailwind / shadcn-oriented UI setup
