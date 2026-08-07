import type { CreateTaskRequest } from "@/lib/model/createTaskRequest";
import type { PageTask } from "@/lib/model/pageTask";
import type { Task } from "@/lib/model/task";
import type { UpdateTaskRequest } from "@/lib/model/updateTaskRequest";

/**
 * In-memory task DB for MSW so list/create/patch/delete stay stable
 * across requests (Orval faker re-rolls every call).
 */
let nextId = 1;
let tasks: Task[] = [];
let seeded = false;

/** ISO-8601 instant aligned with Spring Instant / plan-v3 TaskResponse. */
function nowIso(): string {
  return new Date().toISOString();
}

function seedIfNeeded(): void {
  if (seeded) return;
  seeded = true;
  const seededTasks: Task[] = [];
  for (let i = 1; i <= 23; i++) {
    // Stable-ish seed times so mocks don't look identical every row
    const created = new Date(Date.UTC(2026, 7, 1, 12, 0, 0) + i * 3_600_000);
    const createdAt = created.toISOString();
    seededTasks.push({
      id: nextId++,
      title: `Seed task ${i}`,
      description: i % 3 === 0 ? `Notes for task ${i}` : null,
      dueDate:
        i % 2 === 0
          ? `2026-08-${String((i % 27) + 1).padStart(2, "0")}`
          : null,
      completed: i % 5 === 0,
      userId: 1,
      createdAt,
      updatedAt: createdAt,
    });
  }
  tasks = seededTasks;
}

export function resetTaskStore(): void {
  nextId = 1;
  tasks = [];
  seeded = false;
}

export function listTasksPage(page: number, size: number): PageTask {
  seedIfNeeded();
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, size);
  const totalElements = tasks.length;
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const start = safePage * safeSize;
  const content = tasks.slice(start, start + safeSize);

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    numberOfElements: content.length,
    first: safePage === 0,
    last: totalPages === 0 || safePage >= totalPages - 1,
    empty: content.length === 0,
  };
}

export function listTasksByCompleted(
  completed: boolean,
  page: number,
  size: number
): PageTask {
  seedIfNeeded();
  const filtered = tasks.filter((t) => t.completed === completed);
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, size);
  const totalElements = filtered.length;
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const start = safePage * safeSize;
  const content = filtered.slice(start, start + safeSize);

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    numberOfElements: content.length,
    first: safePage === 0,
    last: totalPages === 0 || safePage >= totalPages - 1,
    empty: content.length === 0,
  };
}

export function getTask(id: number): Task | undefined {
  seedIfNeeded();
  return tasks.find((t) => t.id === id);
}

export function createTask(body: CreateTaskRequest): Task {
  seedIfNeeded();
  const ts = nowIso();
  const task: Task = {
    id: nextId++,
    title: body.title,
    description: body.description ?? null,
    dueDate: body.dueDate ?? null,
    completed: body.completed ?? false,
    userId: body.userId ?? 1,
    createdAt: ts,
    updatedAt: ts,
  };
  // Newest first so create shows on page 0
  tasks = [task, ...tasks];
  return task;
}

export function updateTask(
  id: number,
  body: UpdateTaskRequest
): Task | undefined {
  seedIfNeeded();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  const current = tasks[idx];
  const next: Task = {
    ...current,
    title: body.title !== undefined && body.title !== null ? body.title : current.title,
    description:
      body.description !== undefined ? body.description : current.description,
    dueDate: body.dueDate !== undefined ? body.dueDate : current.dueDate,
    completed:
      body.completed !== undefined && body.completed !== null
        ? body.completed
        : current.completed,
    updatedAt: nowIso(),
  };
  tasks = [...tasks.slice(0, idx), next, ...tasks.slice(idx + 1)];
  return next;
}

export function deleteTask(id: number): boolean {
  seedIfNeeded();
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}

/**
 * Paged date-range list. Real API scopes by userId; mock also includes tasks
 * with matching dueDate even if userId differs (faker login ids vs seed userId=1).
 */
export function listByUserAndDateRange(
  userId: number,
  start: string,
  end: string,
  page: number,
  size: number
): PageTask {
  seedIfNeeded();
  const filtered = tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (t.dueDate < start || t.dueDate > end) return false;
    return t.userId === userId || t.userId === 1;
  });
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, size);
  const totalElements = filtered.length;
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const startIdx = safePage * safeSize;
  const content = filtered.slice(startIdx, startIdx + safeSize);

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    numberOfElements: content.length,
    first: safePage === 0,
    last: totalPages === 0 || safePage >= totalPages - 1,
    empty: content.length === 0,
  };
}
