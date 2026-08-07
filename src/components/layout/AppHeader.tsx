"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserRole } from "@/lib/model/userRole";

type Props = {
  title: string;
};

export function AppHeader({ title }: Props) {
  const { user, logout, busy } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {user && (
            <p className="text-xs text-zinc-500">
              {user.username} · {user.role}
            </p>
          )}
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link
            href="/tasks"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Tasks
          </Link>
          <Link
            href="/account"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Account
          </Link>
          {isAdmin && (
            <Link
              href="/admin/users"
              className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              Users
            </Link>
          )}
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
        </nav>
      </div>
    </header>
  );
}
