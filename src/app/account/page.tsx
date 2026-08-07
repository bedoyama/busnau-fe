"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { userService } from "@/api/userService";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function AccountContent() {
  const { user, refreshUser, logoutAll, busy } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onLogoutAll() {
    const ok = window.confirm(
      "Sign out of every device? This revokes all refresh tokens for your account."
    );
    if (!ok) return;
    await logoutAll();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
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
    const [, error] = await userService.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("Password updated.");
    void refreshUser();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <AppHeader title="Account" />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Profile
          </h2>
          <p className="mt-1 text-sm text-zinc-500">From GET /api/users/me</p>
          {user ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Id
                </dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                  {user.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Username
                </dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                  {user.username}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Role
                </dt>
                <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                  {user.role}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Loading profile…</p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Change password
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            POST /api/users/me/password (min 8 characters)
          </p>

          <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-4" noValidate>
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {fieldErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.currentPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {fieldErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.newPassword}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {formError && (
              <div
                className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300"
                role="alert"
              >
                {formError}
              </div>
            )}
            {success && (
              <div
                className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                role="status"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Sessions
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            POST /api/auth/logout-all — revokes every active refresh token for
            your account. Use this if a device is lost or you shared credentials.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLogoutAll()}
            className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {busy ? "Signing out…" : "Log out everywhere"}
          </button>
        </section>
      </main>
    </div>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
