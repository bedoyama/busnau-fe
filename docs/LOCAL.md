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

1. **Refresh** `openapi/swagger.json` from the live API (preferred):
   ```bash
   curl -s http://localhost:8080/v3/api-docs | jq . > openapi/swagger.json
   ```
   If that returns **401**, Spring Security is matching `/v3/api-docs/**` but not the exact path `/v3/api-docs` — fix permit matchers on the API (or edit `openapi/swagger.json` by hand from controllers + a live `curl` of sample responses, as done for Phase 0.2).
2. Orval outputs land under **`src/` only** (see `orval.config.ts`):
   - models → `src/lib/model/`
   - generated client + MSW → `src/lib/mocks/generated/`
   - hand-written scaffold → `src/lib/mocks/{handlers,browser,node,index}.ts`
   - Do **not** use the legacy top-level `lib/mocks/generated/` tree.
3. Regenerate:
   ```bash
   pnpm generate:api
   ```
4. Fix compile errors (Page types, new paths, auth bodies). Hand-tune MSW if Orval’s faker output is wrong for auth/pages.
5. Smoke mock mode (`pnpm dev`, default) and `/testhandlers` before flipping to real backend.

**Rule of thumb for FE PRs:** if you consume a new/changed endpoint, update OpenAPI + regenerate Orval **and** leave MSW handlers green for that path in the same PR.

**Dev default remains mocks.** Switch to real API only when checking integration (`NEXT_PUBLIC_USE_MOCKS=false` + API on `:8080`; see Mode 2).

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

### Dual-mode readiness (plan-v3 aligned)

Same host is the intended setup: Next on `:3000`, Spring on `:8080`.

| Check | Status |
|-------|--------|
| Default API base URL | `http://localhost:8080` |
| Disable mocks | **Required** for real mode (`NEXT_PUBLIC_USE_MOCKS=false`) or MSW intercepts Java |
| Auth UI | Login, register, session bootstrap via `/api/users/me` |
| OpenAPI / Orval | plan-v3: `TaskResponse` Instant timestamps, paged lists, logout-all |
| MSW | Stateful `taskStore` / `userStore` + custom handlers ahead of Orval faker |
| CORS | API: `app.cors.allowed-origins=http://localhost:3000` (see `application-local.properties.example`) |

**Tokens in localStorage:** `token` (access) + `refreshToken` (see `src/api/authStorage.ts`).

### Quick real-backend smoke (API only)

```bash
# register
curl -s -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"fe_dev","password":"password1"}'

# login — paste accessToken into FE after sign-in (or just use the Login page)
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"fe_dev","password":"password1"}'
```

Optional API script from busnau-api: `./scripts/smoke.sh` (when present).

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

## Dual-mode smoke checklist

Run **twice**: mocks on (`pnpm dev` default), then real API (`USE_MOCKS=false` + API on `:8080` + CORS).

### Auth

| # | Step | Expected |
|---|------|----------|
| 1 | Open `/tasks` while signed out | Redirect to `/login` |
| 2 | `/login` empty submit | Zod field errors |
| 3 | Sign in (mock: any user/password; real: registered user or seed `admin`/`admin123`) | `/tasks`; Local Storage has `token` + `refreshToken` |
| 4 | Header shows username · role; **Log out** works | Clears storage → `/login` |
| 5 | Hard refresh `/tasks` while signed in | Stays signed in (`/api/users/me`) |
| 6 | `/register` valid user | Auto sign-in → `/tasks` |
| 7 | `/account` → **Log out everywhere** | Confirms; all refresh tokens revoked (real); lands on `/login` |

### Tasks (plan-v3)

| # | Step | Expected |
|---|------|----------|
| 8 | Task table columns | Title, Status, Due, **Created**, **Updated**, User id, Actions |
| 9 | Create a task | Appears on page 1; Created/Updated filled (not "—") |
| 10 | Toggle status / edit / delete | Mutations succeed; list refreshes |
| 11 | Status filter Open / Done | Paged lists from completed endpoints |
| 12 | Due from / Due to both set | Date-range **paged** (`page`/`size`); total · page N of M still shown |
| 13 | Pagination Previous / Next | Works for all list modes including date-range |

### Real-mode only

| # | Step | Expected |
|---|------|----------|
| R1 | Network tab | Hits `localhost:8080` (not only Service Worker) |
| R2 | Wrong password | API error on login form |
| R3 | CORS failure | Set `app.cors.allowed-origins=http://localhost:3000`, restart API |
| R4 | After logout-all | Refresh on another tab/device fails until re-login |

**Mock-mode notes**

- Custom `userHandlers` create/login users by username (`admin` → ADMIN).
- `taskStore` seeds ~23 tasks with due dates and Instant timestamps; create/update set `createdAt`/`updatedAt`.

---

## E2E (Playwright, mock mode)

No Java required. Starts a fresh `pnpm dev` with MSW forced on:

```bash
pnpm test:e2e          # headless Chromium
pnpm test:e2e:ui       # interactive UI
```

Coverage (`e2e/auth-tasks.spec.ts`):

- Login → create task (Created/Updated columns present)
- Date-range filter keeps paged chrome
- Account **Log out everywhere** clears session
- Guest `/tasks` → `/login`

First machine: `pnpm exec playwright install chromium` (browsers are not in git).

**Real-backend E2E is manual** (checklist above). Playwright always forces mocks so CI stays free of Java/Postgres.

## Useful scripts

```bash
pnpm dev              # Next dev server
pnpm build            # production build
pnpm lint
pnpm generate:api     # Orval from openapi/swagger.json
pnpm test:e2e         # Playwright against MSW
```

---

## Related docs

- Product / FE roadmap: [plan-v1.md](./plan-v1.md)
- Backend local run: `../busnau-api/docs/QUICKSTART.md`
- Backend API surface: `../busnau-api/README.md`
