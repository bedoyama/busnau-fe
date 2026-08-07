"use client";

import Link from "next/link";
import { hasSession } from "@/api/authStorage";
import { useEffect, useState } from "react";

/**
 * Placeholder landing after login (full task UI is Phase 2).
 * Session check is client-only; 1.3 will add a real auth guard.
 */
export default function TasksPlaceholderPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setSignedIn(hasSession());
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-black">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Tasks
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder page — full list/create UI comes in Phase 2. Auth session:{" "}
        {signedIn === null
          ? "…"
          : signedIn
            ? "signed in (token in localStorage)"
            : "not signed in"}
      </p>
      <div className="flex gap-4 text-sm">
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
        <Link href="/register" className="underline underline-offset-4">
          Register
        </Link>
        <Link href="/testhandlers" className="underline underline-offset-4">
          Test handlers
        </Link>
      </div>
    </div>
  );
}
