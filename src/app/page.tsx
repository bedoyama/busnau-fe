"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserRole } from "@/lib/model/userRole";

export default function HomePage() {
  const { user, status, logout, busy } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Büsnau
            </p>
            <p className="text-xs text-zinc-500">Task manager</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {status === "authenticated" ? (
              <>
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
                <button
                  type="button"
                  onClick={() => void logout()}
                  disabled={busy}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  {busy ? "Signing out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {status === "authenticated"
            ? `Welcome back${user ? `, ${user.username}` : ""}`
            : "Organize your work"}
        </h1>
        <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          {status === "authenticated"
            ? "Jump into tasks, manage your account, or (if you are an admin) manage users."
            : "A simple task manager demo. Create an account or sign in to add tasks, track due dates, and try the app."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {status === "authenticated" ? (
            <>
              <Link
                href="/tasks"
                className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Go to tasks
              </Link>
              <Link
                href="/account"
                className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Account
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Admin users
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <p className="mt-12 text-xs text-zinc-500">
          Demo portfolio app · feedback welcome after you sign in
        </p>
      </main>
    </div>
  );
}
