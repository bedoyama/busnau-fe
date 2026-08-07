"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/model/userRole";
import { RequireAuth } from "./RequireAuth";
import { useAuth } from "./AuthProvider";

function AdminGate({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/tasks");
    }
  }, [status, isAdmin, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Checking session…
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

/** Must be signed in as ADMIN. Non-admins bounce to /tasks. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}
