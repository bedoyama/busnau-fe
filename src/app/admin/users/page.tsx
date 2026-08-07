"use client";

import { useEffect, useState } from "react";
import { userService } from "@/api/userService";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { AppHeader } from "@/components/layout/AppHeader";
import type { PageUser } from "@/lib/model/pageUser";

const PAGE_SIZE = 10;

function AdminUsersContent() {
  const [page, setPage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<PageUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [result, err] = await userService.getAllUsers({
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

  function refreshList() {
    setLoading(true);
    setPage(0);
    setReloadToken((n) => n + 1);
  }

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <AppHeader title="Admin · Users" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <CreateUserForm onCreated={refreshList} />

        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            All users
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
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
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

          {!loading && !error && content.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-500">
              No users found.
            </div>
          )}

          {!loading && !error && content.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Id</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {content.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {u.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.role === "ADMIN"
                            ? "rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200"
                            : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </main>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <AdminUsersContent />
    </RequireAdmin>
  );
}
