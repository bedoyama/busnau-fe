"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { feedbackService } from "@/api/feedbackService";

const schema = z.object({
  message: z
    .string()
    .min(1, "Please enter your feedback")
    .max(4000, "Keep feedback under 4000 characters"),
  contact: z.string().max(200, "Contact is too long").optional(),
});

function FeedbackContent() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setFieldErrors({});

    const parsed = schema.safeParse({
      message: message.trim(),
      contact: contact.trim() || undefined,
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
    const [, error] = await feedbackService.submit({
      message: parsed.data.message,
      contact: parsed.data.contact ?? null,
    });
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setMessage("");
    setContact("");
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <AppHeader title="Feedback" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Send feedback
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tell us what worked, what didn&apos;t, or ideas for the demo. Signed
            in as{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {user?.username ?? "…"}
            </span>
            . Your note is emailed to the project owner.
          </p>

          <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4" noValidate>
            <div>
              <label
                htmlFor="feedback-message"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Message
              </label>
              <textarea
                id="feedback-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="What should we know?"
              />
              {fieldErrors.message && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="feedback-contact"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Contact (optional)
              </label>
              <input
                id="feedback-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Email or LinkedIn if you want a reply"
                autoComplete="email"
              />
              {fieldErrors.contact && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
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
                Thanks — your feedback was sent.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Sending…" : "Send feedback"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <RequireAuth>
      <FeedbackContent />
    </RequireAuth>
  );
}
