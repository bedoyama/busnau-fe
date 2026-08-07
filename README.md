# busnau-fe

Next.js frontend for the [busnau-api](../busnau-api) task manager.

## Architecture

```text
┌─────────────────────┐
│  Browser (Next.js)  │
│  React UI + hooks   │
└──────────┬──────────┘
           │ ky (Bearer JWT)
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│   MSW   │  │  busnau-api  │
│ (mock)  │  │  :8080       │
└─────────┘  └──────────────┘
  default       USE_MOCKS=false
  in dev
```

| Layer | Location | Role |
|-------|----------|------|
| UI routes | `src/app/*` | Pages (login, tasks, account, admin) |
| Auth | `src/components/auth/*`, `src/api/authStorage.ts` | Session, guards, tokens |
| Server state | `src/hooks/useTasksQuery.ts`, `useUsersQuery.ts` | TanStack Query cache + mutations |
| API services | `src/api/*` | ky calls + `handleApiCall` |
| Types | `src/lib/model/*` | Orval-generated OpenAPI models |
| Mocks | `src/lib/mocks/*` | MSW handlers + in-memory stores |

## Package manager

Use **pnpm** only (`pnpm-lock.yaml` is the source of truth):

```bash
pnpm install
pnpm dev
```

Avoid `npm install` so lockfiles do not diverge.

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/LOCAL.md](./docs/LOCAL.md) | Mock vs real backend, env, auth smoke checklist |
| [docs/plan-v1.md](./docs/plan-v1.md) | Roadmap and dual-mode PR checklist |

## Quick start (mock mode — default)

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

No Java/Postgres required. Mock login: any password; username **`admin`** → ADMIN role.

| Route | Notes |
|-------|--------|
| `/` | Landing / app shell |
| `/login`, `/register` | Auth |
| `/tasks` | Task CRUD + filters |
| `/account` | Profile + change password |
| `/admin/users` | ADMIN only |
| `/testhandlers` | MSW smoke |

## Real backend (same machine)

1. Start API (`../busnau-api`) on `http://localhost:8080`.
2. `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

3. Restart `pnpm dev` (Next inlines `NEXT_PUBLIC_*` at startup).

Browser CORS: Spring must allow `http://localhost:3000` if not already. Details: [docs/LOCAL.md](./docs/LOCAL.md).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base (default `http://localhost:8080`) |
| `NEXT_PUBLIC_USE_MOCKS` | `true` / omit in dev → MSW; `false` → real API |

Copy from [`.env.example`](./.env.example). Never commit `.env.local`.

## OpenAPI / mocks regen

When **busnau-api** contract changes:

```bash
# Preferred: live export (API must permit /v3/api-docs)
curl -s http://localhost:8080/v3/api-docs | jq . > openapi/swagger.json

pnpm generate:api
```

Orval writes models to `src/lib/model/` and generated MSW to `src/lib/mocks/generated/`.  
Hand-tuned stores (`taskStore`, `userStore`) live next to `handlers.ts` and are not cleaned away.

## Scripts

```bash
pnpm dev            # Next dev server
pnpm build
pnpm lint
pnpm generate:api   # Orval from openapi/swagger.json
```

## Stack

- Next.js 16 / React 19  
- **ky** HTTP client  
- **TanStack Query** for list/mutation server state  
- **MSW** + Orval for dual-mode development  
- Zod + Tailwind  
