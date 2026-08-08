# Plan: Task list UX feedback (post-demo)

**Source:** Early users / recruiters on the live demo (`tasks.bedoyarama.com` or Vercel).  
**Scope:** Frontend UX polish on the tasks page. API changes only where noted.  
**Process:** Prefer small FE-only commits; keep dual-mode (MSW + real API) green.

---

## Feedback summary

| # | Feedback | Theme |
|---|----------|--------|
| 1 | Paginate after ~**5** tasks to **showcase** paging (not to be perfect) | Demo / pagination |
| 2 | Status change by click is unclear — **Open** doesn’t look clickable | Affordance |
| 3 | Add **time of day** to Due (maybe too complex?) | Data model + forms |
| 4 | **Edit / Delete** as buttons, not link-styled actions | Affordance |
| 5 | Hover **tooltips** | Discoverability |

---

## Recommendations

### 1. Smaller page size for demos (~5)

| | |
|--|--|
| **Effort** | Trivial |
| **API** | None (`page` / `size` already supported) |
| **Risk** | Low |

**Recommendation: do it.**

- Change default `PAGE_SIZE` in `useTasksQuery.ts` from `10` → **`5`**.
- Optional later: env flag `NEXT_PUBLIC_TASK_PAGE_SIZE` so local can stay 10 and production demo uses 5 — only if you care about both.

**Why:** Seed/mock data and a few real tasks already prove “Next page”; size 5 makes pagination visible sooner for recruiters.

---

### 2. Status toggle affordance (Open / Done)

| | |
|--|--|
| **Effort** | Small |
| **API** | None |
| **Risk** | Low |

**Recommendation: do it.**

Today the status control is a bare badge inside a button (`title="Toggle completed"` only). Users don’t recognize it as an action.

Suggested direction (pick one, keep simple):

1. **Primary (recommended):** Make the control look like a control — border, hover ring, cursor pointer, maybe a small “click to toggle” or switch-style label.  
2. Keep badge colors but add visible chrome: `hover:bg-…`, `underline` or `ring` on hover/focus.  
3. Optional: short helper text under the Status column header (“Click to toggle”).

Also improve `title` / `aria-label` to: e.g. “Mark as done” / “Mark as open”.

Touches: `TaskList.tsx` → `TaskRow` status cell.

---

### 3. Due date + time of day

| | |
|--|--|
| **Effort** | **Medium–high** if real |
| **API** | Yes, if stored as datetime |
| **Risk** | Medium (contract, MSW, Orval, filters) |

**Recommendation: defer full time-of-day; optional light FE-only later.**

**Today**

- API `dueDate` is a **date-only** field (`LocalDate` / `YYYY-MM-DD`).
- List filters (date-range) are **date** inclusive bounds.
- FE uses `<input type="date">`.

**If you only need “looks nicer” without backend work**

- Not really: inventing a time in the UI without persisting it confuses users.

**If you want real due datetime**

1. API: change `dueDate` to `Instant` or `OffsetDateTime` (or add `dueAt` and keep `dueDate` deprecated).  
2. Flyway migration for column type.  
3. OpenAPI + Orval + MSW store/handlers.  
4. FE: `datetime-local` (or date + time inputs), display with locale time.  
5. Date-range filter semantics: by calendar day of due, or by instant — product decision.

**Verdict for demo polish pass:** **skip** unless you explicitly want a multi-commit API story. Document as stretch / plan-vNext.

---

### 4. Edit / Delete as clear action buttons

| | |
|--|--|
| **Effort** | Trivial |
| **API** | None |
| **Risk** | Low |

**Recommendation: do it.**

Today markup is already `<button>`, but styles are **link-like** (`underline` on hover, text-only).

Suggested direction:

- Bordered / filled small buttons (zinc outline for Edit, soft red for Delete).  
- Consistent padding and disabled opacity (already partially there).  
- Keep confirm dialog on delete.

Touches: `TaskList.tsx` → `TaskRow` actions cell.

---

### 5. Hover tooltips

| | |
|--|--|
| **Effort** | Small |
| **API** | None |
| **Risk** | Low |

**Recommendation: do it with native `title` first; Radix tooltip later if you want polish.**

Priority tooltips:

| Control | Suggested text |
|---------|----------------|
| Status badge/button | “Click to mark done” / “Click to reopen” |
| Edit | “Edit title, description, due date” |
| Delete | “Delete this task” |
| Due column (empty) | optional: “No due date” |
| Created / Updated | already use `title={iso}` — keep |

Avoid tooltip-only UX; tooltips **supplement** clearer buttons/status (items 2 and 4).

If you add a shared tooltip component later, use existing Radix/shadcn patterns in the repo — not required for v1 of this plan.

---

## Suggested implementation order

Small FE PR (or 1–2 commits), **no API**:

| Step | Item | Outcome |
|------|------|---------|
| A | #1 `PAGE_SIZE = 5` | Pagination shows earlier in demos |
| B | #4 Edit/Delete button styles | Actions read as actions |
| C | #2 Status control chrome + aria/title | Toggle discoverable |
| D | #5 Tooltips on status + actions | Hover hints |

**Out of this pass:** #3 due time-of-day (separate plan + API).

---

## Acceptance checklist (demo UX pass)

- [ ] With >5 tasks, Previous/Next (or page chrome) appears without changing filters much  
- [ ] New users try status toggle without being told  
- [ ] Edit/Delete look like buttons, not hyperlinks  
- [ ] Hovering status/actions shows a short hint  
- [ ] MSW e2e still green (`pnpm test:e2e`)  
- [ ] Real API mode unchanged (same endpoints)

---

## Non-goals

- Perfect pagination UX (infinite scroll, page size picker)  
- Redesign of the whole tasks page  
- Due datetime without an explicit API decision  
- Putting long TODO lists in source files (this doc is the backlog)

---

## Related

- Task UI: `src/components/tasks/TaskList.tsx`, `CreateTaskForm.tsx`  
- Page size: `src/hooks/useTasksQuery.ts`  
- API contract (due date): busnau-api Task DTO / OpenAPI  
- Dual-mode: [LOCAL.md](./LOCAL.md)  
