import { http, HttpResponse } from "msw";
import type { CreateTaskRequest } from "@/lib/model/createTaskRequest";
import type { UpdateTaskRequest } from "@/lib/model/updateTaskRequest";
import {
  createTask,
  deleteTask,
  getTask,
  listByUserAndDateRange,
  listTasksByCompleted,
  listTasksPage,
  updateTask,
} from "./taskStore";

function parsePage(url: URL): { page: number; size: number } {
  const page = Number(url.searchParams.get("page") ?? "0");
  const size = Number(url.searchParams.get("size") ?? "20");
  return {
    page: Number.isFinite(page) ? page : 0,
    size: Number.isFinite(size) && size > 0 ? size : 20,
  };
}

/**
 * Stateful task mocks — registered before Orval handlers so they win.
 */
export const taskHandlers = [
  http.get("*/api/tasks/completed/:completed", ({ request, params }) => {
    const completed = String(params.completed) === "true";
    const { page, size } = parsePage(new URL(request.url));
    return HttpResponse.json(listTasksByCompleted(completed, page, size));
  }),

  http.get("*/api/tasks/user/:userId/date-range", ({ request, params }) => {
    const userId = Number(params.userId);
    const url = new URL(request.url);
    const start = url.searchParams.get("start") ?? "";
    const end = url.searchParams.get("end") ?? "";
    if (!start || !end) {
      return HttpResponse.json(
        { error: "start and end query params are required" },
        { status: 400 }
      );
    }
    return HttpResponse.json(listByUserAndDateRange(userId, start, end));
  }),

  http.get("*/api/tasks/:id", ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return HttpResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    // Avoid treating "completed" path segment as id if order ever flips
    if (String(params.id) === "completed") {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    const task = getTask(id);
    if (!task) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.get("*/api/tasks", ({ request }) => {
    const { page, size } = parsePage(new URL(request.url));
    return HttpResponse.json(listTasksPage(page, size));
  }),

  http.post("*/api/tasks", async ({ request }) => {
    const body = (await request.json()) as CreateTaskRequest;
    if (!body?.title || !String(body.title).trim()) {
      return HttpResponse.json(
        { error: "Validation failed", details: { title: "Title is required" } },
        { status: 400 }
      );
    }
    return HttpResponse.json(createTask(body), { status: 200 });
  }),

  http.patch("*/api/tasks/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateTaskRequest;
    const task = updateTask(id, body ?? {});
    if (!task) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.delete("*/api/tasks/:id", ({ params }) => {
    const id = Number(params.id);
    if (!deleteTask(id)) {
      return HttpResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
