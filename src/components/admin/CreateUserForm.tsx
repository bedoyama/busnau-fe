"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import { userService } from "@/api/userService";
import { UserRole } from "@/lib/model/userRole";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([UserRole.USER, UserRole.ADMIN]),
});

type Props = {
  onCreated: () => void;
};

export function CreateUserForm({ onCreated }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<typeof UserRole.USER | typeof UserRole.ADMIN>(
    UserRole.USER
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = schema.safeParse({ username, password, role });
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
    const [, error] = await userService.createUser({
      username: parsed.data.username,
      password: parsed.data.password,
      role: parsed.data.role,
    });
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setUsername("");
    setPassword("");
    setRole(UserRole.USER);
    onCreated();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      noValidate
    >
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Create user
      </h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        ADMIN-only · POST /api/users with role
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="admin-username"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Username
          </label>
          <input
            id="admin-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            autoComplete="off"
          />
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="admin-role"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Role
          </label>
          <select
            id="admin-role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value as typeof UserRole.USER | typeof UserRole.ADMIN)
            }
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value={UserRole.USER}>USER</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {submitting ? "Creating…" : "Create user"}
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
