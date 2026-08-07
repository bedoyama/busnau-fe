"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { TaskList } from "@/components/tasks/TaskList";

function TasksContent() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <AppHeader title="Tasks" />
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
