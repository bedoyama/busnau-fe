# Plan v1: busnau-fe — mock-aware MVP against busnau-api

**Backend sibling:** `../busnau-api` (Spring Boot task manager API).  
**Local run (mock vs real):** [LOCAL.md](./LOCAL.md).

**Process:** small focused commits; prefer tests/smoke for behavior changes; keep **MSW mocks updated** whenever the OpenAPI contract changes.

---

## Goals

1. Align FE **OpenAPI + Orval + MSW** with the **current** busnau-api (not the stale snapshot).
2. Support **two developer modes** without friction:
   - **Mock** — FE-only (default in dev)
   - **Real backend** — same machine, API on `:8080`
3. Ship a **minimal product UI**: auth + tasks (+ light admin).
4. Wire **React Query** (or Orval-generated clients) instead of ad-hoc `useEffect` only.
5. Document env and regen so mocks do not drift again.

Non-goals for v1: full design system, OAuth, offline-first, native apps.

---

## Constraints (keep in mind every phase)

| Constraint | Implication |
|------------|-------------|
| MSW on by default in dev | Real API needs explicit `NEXT_PUBLIC_USE_MOCKS=false` |
| Orval generates MSW handlers | New API fields/endpoints → regenerate + fix handlers, not hand-only forever |
| API list endpoints are **paged** | FE types and UI must use `content` / `totalElements`, not bare arrays |
| Token key is `localStorage.token` | Login must store API `accessToken` under that key (or rename client + docs together) |
| Error JSON uses `error` / `details` | Map API errors in `handleApiCall` |
| CORS | Real browser calls require API CORS for `http://localhost:3000` if not already enabled |

---

## Phase 0 — Contract sync (do first)

### Commit 0.1 — `docs: local mock vs real backend runbook` ✅ (files present)

- [LOCAL.md](./LOCAL.md) (this repo)
- `.env.example` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_USE_MOCKS`
- Commit when ready (docs currently untracked on `main`)

### Commit 0.2 — `chore: refresh OpenAPI from busnau-api`

- Replace `openapi/swagger.json` (current API: Page, PATCH, /me, logout, auth shapes)
- Fix `orval.config.ts` so **schemas + mocks land under `src/`** (single source of truth)
- Document regenerate in LOCAL.md / README
- Note: live `/v3/api-docs` needed SecurityConfig permit for exact path (API one-liner)

### Commit 0.3 — `chore: regenerate Orval models and MSW handlers`

- `pnpm generate:api`
- Fix imports / delete stale duplicates (`lib/mocks/generated` vs `src/lib/model`)
- Smoke `/testhandlers` under mock mode

### Commit 0.4 — `fix(api): Page types for list endpoints`

- Types for Spring `Page<T>` (or generated schema if present)
- Update `userService` and any task services: parse `content`, expose pagination params
- MSW handlers return page-shaped JSON for GET lists

**Success:** Mock mode green; real mode types match live API for lists.

---

## Phase 1 — HTTP client and auth foundation

### Commit 1.1 — `feat(api): client auth storage and error mapping`

- Store/read `accessToken` (+ optional `refreshToken`)
- Map backend `{ error, details }` in `handleApiCall`
- On 401: attempt refresh once, then clear session / redirect to login
- Retry policy: keep non-POST retries; never retry login/register blindly

### Commit 1.2 — `feat(auth): login and register pages`

- Forms (Zod): login, register
- Call real paths `/api/auth/login`, `/api/users`
- Success → save tokens, redirect to tasks
- MSW: login/register handlers match regenerated OpenAPI

### Commit 1.3 — `feat(auth): session provider and protected routes`

- Auth context / React Query user (`GET /api/users/me`)
- Layout: public vs authenticated
- Logout → `POST /api/auth/logout` with refresh token + clear storage
- MSW: `/me`, logout, refresh

### Commit 1.4 — `test/smoke: auth flows mock mode`

- Manual checklist or minimal Playwright/Cypress later; at least document steps in LOCAL.md

**Success:** Register/login/logout works in **mock** and **real** modes (with API up).

---

## Phase 2 — Tasks product UI

### Commit 2.1 — `feat(tasks): list page (paged)`

- Fetch `GET /api/tasks?page=&size=`
- Table/cards: title, completed, dueDate, userId
- Loading / empty / error states
- MSW: paged list

### Commit 2.2 — `feat(tasks): create task`

- Form → `POST /api/tasks`
- Invalidate list query
- MSW: create

### Commit 2.3 — `feat(tasks): update and complete (PATCH)`

- Toggle completed + edit title/description/dueDate
- `PATCH /api/tasks/{id}`
- MSW: patch

### Commit 2.4 — `feat(tasks): delete`

- Confirm + `DELETE /api/tasks/{id}`
- MSW: delete

### Commit 2.5 — `feat(tasks): filters (completed, optional date range)`

- Use paged completed endpoint; date-range when needed
- MSW: matching handlers

**Success:** Full personal task loop against mock and real API.

---

## Phase 3 — Account and admin (light)

### Commit 3.1 — `feat(account): profile and change password`

- Show `/me`
- `POST /api/users/me/password`
- MSW

### Commit 3.2 — `feat(admin): user list (paged, ADMIN only)`

- Guard by role from `/me`
- `GET /api/users?page=&size=`
- MSW

### Commit 3.3 (optional) — `feat(admin): create user with role`

- ADMIN-only create with role ADMIN/USER
- MSW

---

## Phase 4 — Engineering hygiene

### Commit 4.1 — `chore: React Query provider and migrate data hooks`

- `QueryClientProvider` in layout
- Prefer Orval React Query client **or** thin hooks over raw ky in pages

### Commit 4.2 — `chore: drop unused axios; standardize on pnpm`

- Remove unused dependency
- README: pnpm only; document dual mode (link LOCAL.md)

### Commit 4.3 — `chore: replace create-next-app home with app shell`

- Nav: Tasks, Account, Admin (if ADMIN), Login
- Remove default marketing template

### Commit 4.4 — `docs: README project overview`

- Architecture diagram: Next ↔ MSW or busnau-api
- Env table, generate:api, link to plan + LOCAL

---

## Phase 5 — Optional stretch

| Item | Notes |
|------|--------|
| CORS helper PR on busnau-api | `localhost:3000` for local profile |
| E2E (Playwright) mock mode | Login + create task |
| E2E against compose stack | CI later |
| Align with backend plan-v3 DTOs | When API ships TaskResponse/UserResponse |

---

## Dual-mode checklist (every feature PR)

- [ ] OpenAPI updated if API contract changed  
- [ ] `pnpm generate:api` run (or MSW hand-updated with reason)  
- [ ] Works with **mocks on** (`USE_MOCKS` true / default dev)  
- [ ] Works with **mocks off** + API on `:8080` (happy path at least)  
- [ ] Errors show API `error` message when present  
- [ ] No secrets committed (`.env.local` stays gitignored)  

---

## Suggested first week (when you return)

1. **0.1–0.4** — contract sync + page types + LOCAL/env  
2. **1.1–1.3** — client + login/register + session  
3. **2.1–2.3** — task list, create, patch  

That is enough for a demo FE against either mocks or real busnau-api.

---

## Success criteria (v1 FE MVP)

- [ ] Dev can run **mock mode** with zero Java  
- [ ] Dev can run **real mode** with API on same machine via `.env.local`  
- [ ] OpenAPI/Orval/MSW match current busnau-api (incl. Page, PATCH, me, logout)  
- [ ] User can register/login, manage own tasks, logout  
- [ ] ADMIN can open a basic user list  
- [ ] README + LOCAL.md explain both modes  
- [ ] New endpoints always get mocks in the same PR  

---

## Out of scope (later)

- Full design system / marketing site  
- OAuth / SSO  
- Offline PWA  
- Mobile apps  
- Backend ownership of FE CI (unless monorepo later)  
