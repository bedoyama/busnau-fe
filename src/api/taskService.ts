import { api } from "./client";
import { handleApiCall } from "./utils";
import type { CreateTaskRequest } from "@/lib/model/createTaskRequest";
import type { GetAllTasksParams } from "@/lib/model/getAllTasksParams";
import type { GetTasksByCompletedParams } from "@/lib/model/getTasksByCompletedParams";
import type { PageTask } from "@/lib/model/pageTask";
import type { Task } from "@/lib/model/task";
import type { UpdateTaskRequest } from "@/lib/model/updateTaskRequest";

function toSearchParams(
  params?: GetAllTasksParams | GetTasksByCompletedParams
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.page !== undefined) out.page = params.page;
  if (params.size !== undefined) out.size = params.size;
  if (params.sort !== undefined) {
    const sort = params.sort;
    if (Array.isArray(sort)) {
      if (sort.length > 0) out.sort = sort[0] as string;
    } else {
      out.sort = sort as string;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export const taskService = {
  /**
   * Paged tasks visible to the caller (Spring `Page<Task>`).
   */
  getAllTasks: (params?: GetAllTasksParams) =>
    handleApiCall(
      api
        .get("api/tasks", { searchParams: toSearchParams(params) })
        .json<PageTask>()
    ),

  getTasksByCompleted: (completed: boolean, params?: GetTasksByCompletedParams) =>
    handleApiCall(
      api
        .get(`api/tasks/completed/${completed}`, {
          searchParams: toSearchParams(params),
        })
        .json<PageTask>()
    ),

  /** Non-paged list for a user between due dates (inclusive). */
  getTasksByUserIdAndDateRange: (
    userId: number,
    start: string,
    end: string
  ) =>
    handleApiCall(
      api
        .get(`api/tasks/user/${userId}/date-range`, {
          searchParams: { start, end },
        })
        .json<Task[]>()
    ),

  getTaskById: (id: number) =>
    handleApiCall(api.get(`api/tasks/${id}`).json<Task>()),

  createTask: (body: CreateTaskRequest) =>
    handleApiCall(api.post("api/tasks", { json: body }).json<Task>()),

  updateTask: (id: number, body: UpdateTaskRequest) =>
    handleApiCall(api.patch(`api/tasks/${id}`, { json: body }).json<Task>()),

  deleteTask: (id: number) =>
    handleApiCall(api.delete(`api/tasks/${id}`).then(() => undefined as void)),
};
