# Running busnau-fe locally

Two supported modes so frontend and backend work can stay independent:

| Mode | When to use | Frontend talks to |
|------|-------------|-------------------|
| **Mock** (default in dev) | FE-only work, no Java/Postgres | **MSW** intercepts `/api/*` in the browser (and Node via instrumentation) |
| **Real backend** | Integration, auth, real data | **busnau-api** at `http://localhost:8080` |

---

## Prerequisites

| Tool | Notes |
|------|--------|
| Node | See `.nvmrc` (e.g. 24) |
| Package manager | Prefer **pnpm** (`pnpm-lock.yaml` is present); `npm` also works |
| Optional | Docker + Java 21 if you run the real API (`../busnau-api`) |

```bash
cd busnau-fe
pnpm install   # or: npm install
```

---

## Mode 1 — Mock backend (default)

MSW starts when:

- `NEXT_PUBLIC_USE_MOCKS=true`, **or**
- `NODE_ENV=development` and `NEXT_PUBLIC_USE_MOCKS` is **not** `false`

```bash
# From busnau-fe
pnpm dev
# open http://localhost:3000
# debug handlers: http://localhost:3000/testhandlers
```

Optional explicit env (gitignored):

```bash
# .env.local
NEXT_PUBLIC_USE_MOCKS=true
# NEXT_PUBLIC_API_URL is ignored for mocked paths (requests never leave the browser)
```

### What is mocked?

- Generated handlers from OpenAPI via Orval → `src/lib/mocks/endpoints.msw.ts` (and related)
- Wired in `src/lib/mocks/handlers.ts`
- Browser: `MswProvider` in `layout.tsx`
- Node/SSR: `src/instrumentation.ts` + `src/lib/mocks/node.ts`

### Keeping mocks in sync with the API

Whenever **busnau-api** adds or changes endpoints:

1. Export OpenAPI from a running API (or committed export):
   ```bash
   curl -s http://localhost:8080/v3/api-docs > openapi/swagger.json
   ```
2. Align `orval.config.ts` output paths with where the app imports from (today models live under `src/lib/model` / mocks under `src/lib/mocks` — keep one canonical layout).
3. Regenerate:
   ```bash
   pnpm generate:api
   ```
4. Fix compile errors (Page types, new paths, auth bodies).
5. Smoke `/testhandlers` and the feature UI against **mocks** before flipping to real backend.

**Rule of thumb for FE PRs:** if you consume a new/changed endpoint, regenerate Orval **and** leave MSW handlers green for that path.

---

## Mode 2 — Real backend (same machine)

### 1. Start busnau-api

See `../busnau-api/docs/QUICKSTART.md` (typical):

```bash
cd ../busnau-api
# .env + application-local.properties configured
docker compose up -d db
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
# API: http://localhost:8080
```

Seed admin (examples): `admin` / `admin123` when users table is empty.

### 2. Point the FE at the API and disable mocks

```bash
# busnau-fe/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCKS=false
```

```bash
cd busnau-fe
pnpm dev
# http://localhost:3000
```

The ky client (`src/api/client.ts`) uses:

```ts
prefixUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
```

and sends `Authorization: Bearer <token>` from `localStorage.token` when present.

### Can it talk to the backend on this machine **right now**?

**Short answer:** yes for networking, not yet as a polished app.

Same host is the intended setup: Next on `:3000`, Spring on `:8080`. The ky client already defaults to `http://localhost:8080`. What still blocks a smooth browser integration:

| Check | Status |
|-------|--------|
| Default API base URL | `http://localhost:8080` — correct for co-located API |
| Disable mocks | **Required** (`NEXT_PUBLIC_USE_MOCKS=false`) or MSW intercepts and you never hit Java |
| Auth UI | Login page not built yet; for manual smoke set `localStorage.token` to an API `accessToken` |
| OpenAPI / MSW freshness | **Stale** vs current API (missing PATCH, logout, `/me`, **Page** wrappers, etc.) |
| CORS | **Not configured** on busnau-api today. Browser calls from `http://localhost:3000` → `http://localhost:8080` will fail CORS preflight until Spring allows the FE origin (add on the API side; FE cannot fix this alone) |

**Practical answer:** curl/Postman against the API works; FE→API in the browser needs `USE_MOCKS=false` + API CORS for `:3000` + refreshed OpenAPI/MSW + a login that stores `accessToken` under `localStorage.token`.

### Quick real-backend smoke (API only)

```bash
# register
curl -s -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"fe_dev","password":"password1"}'

# login — use accessToken as Bearer in FE localStorage key "token"
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"fe_dev","password":"password1"}'
```

---

## Switching modes without confusion

| Goal | Env |
|------|-----|
| FE solo | `NEXT_PUBLIC_USE_MOCKS=true` (or omit; dev default on) |
| FE + API | `NEXT_PUBLIC_USE_MOCKS=false` + `NEXT_PUBLIC_API_URL=http://localhost:8080` |
| Hard refresh after env change | Restart `pnpm dev` (Next inlines `NEXT_PUBLIC_*` at start) |

If both seem “wrong,” check the browser Network tab:

- Mock: no request to `:8080`, responses from service worker  
- Real: requests to `localhost:8080`

---

## Useful scripts

```bash
pnpm dev              # Next dev server
pnpm build            # production build
pnpm lint
pnpm generate:api     # Orval from openapi/swagger.json
```

---

## Related docs

- Product / FE roadmap: [plan-v1.md](./plan-v1.md)
- Backend local run: `../busnau-api/docs/QUICKSTART.md`
- Backend API surface: `../busnau-api/README.md`
