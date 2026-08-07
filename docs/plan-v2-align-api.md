# Plan v2: Align FE to busnau-api plan-v3

**Backend:** DTOs, timestamps, paged lists, logout-all, CORS.  
**Process:** one commit at a time; keep MSW mocks in sync.

## Commits

| # | Commit | Status |
|---|--------|--------|
| 1 | Refresh OpenAPI | in progress |
| 2 | Regenerate Orval models + MSW | pending |
| 3 | Page date-range (and by-user) in services/UI/mocks | pending |
| 4 | Show createdAt / updatedAt | pending |
| 5 | logout-all | pending |
| 6 | E2E + dual-mode docs | pending |

## Commit 1 notes

- Live `GET /v3/api-docs` returned **401** on the running instance (security permit may need full app restart after API SecurityConfig fix).
- Spec rebuilt from controllers + **live sampled** task/user JSON (`createdAt`/`updatedAt`, Page shape).
- Prefer later: `curl -s http://localhost:8080/v3/api-docs | jq . > openapi/swagger.json` when export works.
