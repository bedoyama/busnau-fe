"use client";

import { useEffect, useState } from "react";
import { taskService } from "@/api/taskService";
import type { PageTask } from "@/lib/model/pageTask";
import type { Task } from "@/lib/model/task";
import { CreateTaskForm } from "./CreateTaskForm";

const PAGE_SIZE = 10;

function formatDueDate(dueDate: Task["dueDate"]): string {
  if (!dueDate) return "—";
  return dueDate;
}

function TaskRow({ task }: { task: Task }) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {task.title}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {task.completed ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Done
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Open
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {formatDueDate(task.dueDate)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {task.userId ?? "—"}
      </td>
    </tr>
  );
}

export function TaskList() {
  const [page, setPage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<PageTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [result, err] = await taskService.getAllTasks({
        page,
        size: PAGE_SIZE,
      });
      if (cancelled) return;

      if (err) {
        setError(err);
        setData(null);
      } else {
        setError(null);
        setData(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  function goToPage(next: number) {
    setLoading(true);
    setPage(next);
  }

  function refreshList(resetToFirstPage = false) {
    setLoading(true);
    if (resetToFirstPage) {
      setPage(0);
    }
    setReloadToken((n) => n + 1);
  }

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const content = data?.content ?? [];
  const isEmpty = !loading && !error && content.length === 0;

  return (
    <div className="w-full">
      <CreateTaskForm onCreated={() => refreshList(true)} />

      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Your tasks
        </h2>
        {!loading && !error && (
          <p className="text-xs text-zinc-500">
            {totalElements} total · page {page + 1}
            {totalPages > 0 ? ` of ${totalPages}` : ""}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {loading && (
          <div className="space-y-3 p-6">
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        )}

        {error && (
          <div
            className="m-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {isEmpty && (
          <div className="p-8 text-center text-sm text-zinc-500">
            No tasks yet. Add one above.
          </div>
        )}

        {!loading && !error && content.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">User id</th>
                </tr>
              </thead>
              <tbody>
                {content.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!error && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading || page <= 0}
            onClick={() => goToPage(page - 1)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || page >= totalPages - 1}
            onClick={() => goToPage(page + 1)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
