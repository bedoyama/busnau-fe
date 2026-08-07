"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  PAGE_SIZE,
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
  type StatusFilter,
} from "@/hooks/useTasksQuery";
import type { Task } from "@/lib/model/task";
import { CreateTaskForm } from "./CreateTaskForm";

function formatDueDate(dueDate: Task["dueDate"]): string {
  if (!dueDate) return "—";
  return dueDate;
}

/** Format plan-v3 Instant (ISO-8601) for list display. */
function formatInstant(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type EditFields = { title: string; description: string; dueDate: string };

function TaskEditForm({
  task,
  busy,
  onCancel,
  onSave,
}: {
  task: Task;
  busy: boolean;
  onCancel: () => void;
  onSave: (fields: EditFields) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");

  function submitEdit(e: FormEvent) {
    e.preventDefault();
    onSave({ title, description, dueDate });
  }

  return (
    <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <td colSpan={7} className="px-4 py-3">
        <form onSubmit={submitEdit} className="grid gap-2 sm:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 sm:col-span-2"
            placeholder="Title"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 sm:col-span-2"
            placeholder="Description"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="flex gap-2 sm:col-span-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function TaskRow({
  task,
  busy,
  onToggleComplete,
  onStartEdit,
  onDelete,
}: {
  task: Task;
  busy: boolean;
  onToggleComplete: (task: Task) => void;
  onStartEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {task.title}
        {task.description ? (
          <p className="mt-0.5 text-xs font-normal text-zinc-500">{task.description}</p>
        ) : null}
      </td>
      <td className="px-4 py-3 text-sm">
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggleComplete(task)}
          className="disabled:opacity-50"
          title="Toggle completed"
        >
          {task.completed ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Done
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Open
            </span>
          )}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {formatDueDate(task.dueDate)}
      </td>
      <td
        className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400"
        title={task.createdAt}
      >
        {formatInstant(task.createdAt)}
      </td>
      <td
        className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400"
        title={task.updatedAt}
      >
        {formatInstant(task.updatedAt)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {task.userId ?? "—"}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onStartEdit(task)}
            className="text-xs font-medium text-zinc-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-zinc-300"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(task)}
            className="text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function TaskList() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const tasksQuery = useTasksQuery({
    page,
    size: PAGE_SIZE,
    status: statusFilter,
    startDate,
    endDate,
    userId: user?.id,
  });

  const updateMutation = useUpdateTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  const data = tasksQuery.data ?? null;
  const loading = tasksQuery.isLoading || tasksQuery.isFetching;
  const error = tasksQuery.error
    ? tasksQuery.error instanceof Error
      ? tasksQuery.error.message
      : "Failed to load tasks"
    : null;

  const busyId =
    updateMutation.isPending && updateMutation.variables
      ? updateMutation.variables.id
      : deleteMutation.isPending && deleteMutation.variables != null
        ? deleteMutation.variables
        : null;

  function setFilterStatus(next: StatusFilter) {
    setEditingId(null);
    setPage(0);
    setStatusFilter(next);
  }

  function onStartDateChange(value: string) {
    setEditingId(null);
    setPage(0);
    setStartDate(value);
  }

  function onEndDateChange(value: string) {
    setEditingId(null);
    setPage(0);
    setEndDate(value);
  }

  function clearDates() {
    setEditingId(null);
    setPage(0);
    setStartDate("");
    setEndDate("");
  }

  async function onToggleComplete(task: Task) {
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        body: { completed: !task.completed },
      });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update task");
    }
  }

  async function onSaveEdit(task: Task, fields: EditFields) {
    const title = fields.title.trim();
    if (!title) {
      setActionError("Title is required");
      return;
    }
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        body: {
          title,
          description: fields.description.trim() || null,
          dueDate: fields.dueDate || null,
        },
      });
      setEditingId(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update task");
    }
  }

  async function onDelete(task: Task) {
    const ok = window.confirm(`Delete task “${task.title}”?`);
    if (!ok) return;

    setActionError(null);
    try {
      await deleteMutation.mutateAsync(task.id);
      const remainingOnPage = (data?.content.length ?? 1) - 1;
      if (remainingOnPage <= 0 && page > 0) {
        setPage((p) => p - 1);
      }
      setEditingId(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to delete task");
    }
  }

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const content = data?.content ?? [];
  const isEmpty = !loading && !error && content.length === 0;

  return (
    <div className="w-full">
      <CreateTaskForm
        onCreated={() => {
          setPage(0);
          setEditingId(null);
        }}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Status
          </span>
          {(
            [
              ["all", "All"],
              ["open", "Open"],
              ["done", "Done"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterStatus(value)}
              className={
                statusFilter === value
                  ? "rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="filter-start"
              className="block text-xs font-medium text-zinc-500"
            >
              Due from
            </label>
            <input
              id="filter-start"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="mt-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label
              htmlFor="filter-end"
              className="block text-xs font-medium text-zinc-500"
            >
              Due to
            </label>
            <input
              id="filter-end"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="mt-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={clearDates}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

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

      {actionError && (
        <div
          className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {actionError}
        </div>
      )}

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
            <table className="w-full min-w-[48rem] text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">User id</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map((task) =>
                  editingId === task.id ? (
                    <TaskEditForm
                      key={`edit-${task.id}`}
                      task={task}
                      busy={busyId === task.id}
                      onCancel={() => setEditingId(null)}
                      onSave={(fields) => void onSaveEdit(task, fields)}
                    />
                  ) : (
                    <TaskRow
                      key={task.id}
                      task={task}
                      busy={busyId === task.id}
                      onToggleComplete={(t) => void onToggleComplete(t)}
                      onStartEdit={(t) => setEditingId(t.id)}
                      onDelete={(t) => void onDelete(t)}
                    />
                  )
                )}
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
            onClick={() => {
              setEditingId(null);
              setPage((p) => p - 1);
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || page >= totalPages - 1}
            onClick={() => {
              setEditingId(null);
              setPage((p) => p + 1);
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
