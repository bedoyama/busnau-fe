"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { TaskList } from "@/components/tasks/TaskList";

function TasksContent() {
  const { user, logout, busy } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Tasks
            </h1>
            {user && (
              <p className="text-xs text-zinc-500">
                {user.username} · {user.role}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/testhandlers"
              className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              Handlers
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={busy}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {busy ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <TaskList />
      </main>
    </div>
  );
}

export default function TasksPage() {
  return (
    <RequireAuth>
      <TasksContent />
    </RequireAuth>
  );
}
