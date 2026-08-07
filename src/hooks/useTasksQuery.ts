"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/api/taskService";
import type { CreateTaskRequest } from "@/lib/model/createTaskRequest";
import type { PageTask } from "@/lib/model/pageTask";
import type { Task } from "@/lib/model/task";
import type { UpdateTaskRequest } from "@/lib/model/updateTaskRequest";

export type StatusFilter = "all" | "open" | "done";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters: {
    page: number;
    size: number;
    status: StatusFilter;
    startDate: string;
    endDate: string;
    userId?: number;
  }) => [...taskKeys.all, "list", filters] as const,
};

const PAGE_SIZE = 10;

/** Status filter is client-side on the current page (date-range API has no completed param). */
function filterPageByStatus(page: PageTask, status: StatusFilter): PageTask {
  if (status === "all") return page;
  const content = (page.content ?? []).filter((t: Task) =>
    status === "open" ? !t.completed : t.completed
  );
  return {
    ...page,
    content,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

async function fetchTasksPage(input: {
  page: number;
  size: number;
  status: StatusFilter;
  startDate: string;
  endDate: string;
  userId?: number;
}): Promise<PageTask> {
  const { page, size, status, startDate, endDate, userId } = input;
  const dateRangeActive = Boolean(startDate && endDate);
  const dateRangeInvalid = Boolean(startDate && endDate && startDate > endDate);

  if (dateRangeInvalid) {
    throw new Error("Start date must be on or before end date");
  }

  if (dateRangeActive) {
    if (userId == null) {
      throw new Error("Signed-in user id required for date range filter");
    }
    const [result, err] = await taskService.getTasksByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
      { page, size }
    );
    if (err) throw new Error(err);
    return filterPageByStatus(result!, status);
  }

  if (status === "open") {
    const [result, err] = await taskService.getTasksByCompleted(false, {
      page,
      size,
    });
    if (err) throw new Error(err);
    return result!;
  }

  if (status === "done") {
    const [result, err] = await taskService.getTasksByCompleted(true, {
      page,
      size,
    });
    if (err) throw new Error(err);
    return result!;
  }

  const [result, err] = await taskService.getAllTasks({ page, size });
  if (err) throw new Error(err);
  return result!;
}

export function useTasksQuery(filters: {
  page: number;
  size?: number;
  status: StatusFilter;
  startDate: string;
  endDate: string;
  userId?: number;
}) {
  const size = filters.size ?? PAGE_SIZE;
  const key = taskKeys.list({ ...filters, size });

  return useQuery({
    queryKey: key,
    queryFn: () => fetchTasksPage({ ...filters, size }),
  });
}

export function useCreateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTaskRequest) => {
      const [data, err] = await taskService.createTask(body);
      if (err) throw new Error(err);
      return data!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; body: UpdateTaskRequest }) => {
      const [data, err] = await taskService.updateTask(input.id, input.body);
      if (err) throw new Error(err);
      return data!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const [, err] = await taskService.deleteTask(id);
      if (err) throw new Error(err);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export { PAGE_SIZE };
