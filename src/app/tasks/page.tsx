"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

function TasksContent() {
  const { user, logout, busy } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-black">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Tasks
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder — full list/create UI is Phase 2.
      </p>
      {user && (
        <p className="text-sm text-zinc-800 dark:text-zinc-200">
          Signed in as <span className="font-medium">{user.username}</span> (
          {user.role})
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/testhandlers" className="underline underline-offset-4">
          Test handlers
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
  );
}

export default function TasksPage() {
  return (
    <RequireAuth>
      <TasksContent />
    </RequireAuth>
  );
}
