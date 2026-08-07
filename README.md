# busnau-fe

Next.js frontend for the [busnau-api](../busnau-api) task manager.

## Package manager

Use **pnpm** only (`pnpm-lock.yaml` is the source of truth). Prefer:

```bash
pnpm install
pnpm dev
```

Avoid `npm install` / `package-lock.json` so lockfiles do not diverge.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/LOCAL.md](./docs/LOCAL.md) | Mock vs real backend, env, auth smoke checklist |
| [docs/plan-v1.md](./docs/plan-v1.md) | FE roadmap and dual-mode PR checklist |

## Quick start (mock mode — default)

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

Mocks are **on by default in development**. No Java or Postgres required.

Useful routes after sign-in: `/tasks`, `/account`; as `admin` (mock): `/admin/users`.

## Real backend (same machine)

1. Start API (`../busnau-api`) on `http://localhost:8080`.
2. Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

3. Restart `pnpm dev`.

See [docs/LOCAL.md](./docs/LOCAL.md) for CORS notes and regenerating mocks when the API changes.

## Scripts

```bash
pnpm dev            # Next dev server
pnpm build
pnpm lint
pnpm generate:api   # Orval from openapi/swagger.json → models + MSW
```

## Stack

- Next.js 16 / React 19
- **ky** HTTP client → `NEXT_PUBLIC_API_URL` (not axios)
- **TanStack Query** for server-state (tasks/users lists + mutations)
- **MSW** mock backend (Orval + hand-tuned stores)
- Zod + Tailwind
