# Cheap deploy: Vercel FE + Railway API + Neon

Frontend half of the lowest-cost stack. Full API steps live in **busnau-api** → `docs/DEPLOY-CHEAP.md`.

| Layer | Service |
|-------|---------|
| FE | **Vercel** (this repo) |
| API | Railway (`busnau-api` Dockerfile, profile `prod`) |
| DB | Neon free Postgres |

---

## Prerequisites

1. API already healthy: `curl -sf https://YOUR-RAILWAY-HOST/actuator/health`
2. You can register/login against that host with curl (see API deploy doc)
3. You know the public Railway HTTPS URL

---

## Vercel setup

1. [vercel.com](https://vercel.com) → **Add New Project** → import **busnau-fe** from GitHub.
2. Framework: **Next.js** (default). Root directory: repo root. Install: `pnpm` if Vercel detects the lockfile.
3. **Environment variables** (Production at minimum):

| Name | Value | Notes |
|------|--------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-HOST` | No trailing slash |
| `NEXT_PUBLIC_USE_MOCKS` | `false` | Required — otherwise production could still mock if forced true |

4. Deploy.
5. Open `https://YOUR-PROJECT.vercel.app`.

---

## CORS (API side)

On Railway, set:

```dotenv
APP_CORS_ALLOWED_ORIGINS=https://YOUR-PROJECT.vercel.app
```

Exact origin, including `https://`. After changing CORS, restart/redeploy the API.

If you add a custom domain on Vercel, update CORS and redeploy API again.

---

## Smoke in the browser

| Step | Expected |
|------|----------|
| Open site | Landing / login (not blank forever) |
| Register new user | Lands on tasks |
| Create a task | Row appears; Created/Updated filled |
| Account → Log out everywhere | Back to login |
| Hard refresh while logged in | Still authenticated |

If Network tab shows requests to `localhost:8080`, the build baked the wrong `NEXT_PUBLIC_API_URL` — fix env and **redeploy**.

---

## Local vs deployed

| Mode | Env |
|------|-----|
| Local mocks | `NEXT_PUBLIC_USE_MOCKS=true` or omit in dev |
| Local real API | `USE_MOCKS=false` + `API_URL=http://localhost:8080` |
| Vercel production | `USE_MOCKS=false` + Railway HTTPS URL |

Do **not** commit `.env.local` with production secrets (there are none on FE except public URL).

---

## Preview deployments

Vercel Preview URLs are different origins. Spring CORS is exact-match:

- Easiest: only smoke **Production** FE against Railway, or  
- Add each preview origin to `APP_CORS_ALLOWED_ORIGINS` when needed.

---

## Related

- Dual-mode local: [LOCAL.md](./LOCAL.md)
- API deploy: `../busnau-api/docs/DEPLOY-CHEAP.md`
