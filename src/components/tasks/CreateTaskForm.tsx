"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import { taskService } from "@/api/taskService";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

type Props = {
  onCreated: () => void;
};

export function CreateTaskForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = schema.safeParse({
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }

    setSubmitting(true);
    const [, error] = await taskService.createTask({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      dueDate: parsed.data.dueDate ?? null,
      completed: false,
    });
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    onCreated();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      noValidate
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        New task
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="task-title"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Title
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="What needs doing?"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="task-description"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Description (optional)
          </label>
          <input
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div>
          <label
            htmlFor="task-due"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Due date (optional)
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {submitting ? "Creating…" : "Add task"}
          </button>
        </div>
      </div>
      {formError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}
    </form>
  );
}
