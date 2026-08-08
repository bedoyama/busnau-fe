# Plan: Demo seed tasks (showcase pagination)

**Goal:** One-click sample tasks so recruiters see **pagination** without hand-creating rows.  
**Mode:** FE-only (existing `POST /api/tasks`). MSW + real API.  
**Process:** one commit at a time; pause before each commit.

---

## Commits (2)

| # | Commit | What |
|---|--------|------|
| **1** | `feat(ui): smaller task page size for demos` | `PAGE_SIZE` **10 → 5** so two pages appear sooner |
| **2** | `feat(ui): add demo tasks to showcase pagination` | Button creates **`PAGE_SIZE * 2`** tasks (`[Demo]` prefix), progress, clear copy |

**Why 2 commits:** page size is a one-line product tweak; seed UI is separate and reviewable alone.

**Out of scope:** bulk delete, API bulk endpoint, due datetime, status/edit polish (see `plan-ux-task-list-feedback.md`).

---

## Commit 1 — page size 5

- `src/hooks/useTasksQuery.ts`: `PAGE_SIZE = 5`
- No API / OpenAPI change
- Smoke: list shows 5 per page when more exist; e2e still OK (create still lands on page 0)

---

## Commit 2 — demo seed button

- Place a **Demo tools** strip on tasks page (muted, not primary “Add task”)
- Button label e.g. **“Add 10 demo tasks (shows pagination)”**  
  (count = `PAGE_SIZE * 2`, derived from constant so it stays in sync)
- On click:
  - Disable button; show progress `Creating n/10…`
  - Sequential `createTask` with titles `[Demo] …`, varied completed/dueDate optional
  - Invalidate list / `onCreated`-style refresh; jump to page 0
- Failures: surface first error; stop or continue best-effort (prefer stop + message)
- Optional confirm dialog once
- No env gate in v1 (always visible on `/tasks` when signed in) — can hide later via env if needed

**Files (expected):** `TaskList.tsx` and/or small `DemoSeedTasksButton.tsx`; reuse `useCreateTaskMutation` or call `taskService` in a short loop with query invalidation.

---

## Acceptance

- [ ] Fresh user with 0 tasks → click demo → **≥ 2 pages** of results  
- [ ] Titles clearly marked `[Demo]`  
- [ ] Button text explains pagination  
- [ ] `pnpm test:e2e` still passes (guest + login/create; no need to click demo in e2e)

---

## Status

| # | Status |
|---|--------|
| 1 | done (`0089a3f`) |
| 2 | ready to commit |
