"use client";

import { useEffect, useState } from "react";
import { taskService } from "@/api/taskService";
import { userService } from "@/api/userService";
import type { PageTask } from "@/lib/model/pageTask";
import type { PageUser } from "@/lib/model/pageUser";

function Card({
  title,
  loading,
  error,
  data,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  data: unknown;
}) {
  return (
    <div className="w-full max-w-xl p-6 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {loading && (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
          </div>
        </div>
      )}

      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {!!data && !loading && !error && (
        <div className="bg-zinc-50 dark:bg-black p-4 rounded overflow-auto border border-zinc-200 dark:border-zinc-800 max-h-96">
          <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function TestPage() {
  const [healthData, setHealthData] = useState<unknown>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [usersData, setUsersData] = useState<PageUser | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [tasksData, setTasksData] = useState<PageTask | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setHealthData(json);
        setHealthLoading(false);
      })
      .catch((err) => {
        setHealthError(err instanceof Error ? err.message : "An unknown error occurred");
        setHealthLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [data, error] = await userService.getAllUsers({ page: 0, size: 5 });
      if (cancelled) return;
      if (error) setUsersError(error);
      else setUsersData(data);
      setUsersLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [data, error] = await taskService.getAllTasks({ page: 0, size: 5 });
      if (cancelled) return;
      if (error) setTasksError(error);
      else setTasksData(data);
      setTasksLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const usersSummary =
    usersData &&
    `page ${usersData.number} · ${usersData.content?.length ?? 0} items · total ${usersData.totalElements}`;

  const tasksSummary =
    tasksData &&
    `page ${tasksData.number} · ${tasksData.content?.length ?? 0} items · total ${tasksData.totalElements}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-2">API Handler Tests</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Smoke page for MSW mocks (default in dev). List endpoints return Spring{" "}
          <code className="font-mono">Page</code> JSON (
          <code className="font-mono">content</code>,{" "}
          <code className="font-mono">totalElements</code>, …).
        </p>
      </div>

      <Card
        title="GET /api/health (custom mock)"
        loading={healthLoading}
        error={healthError}
        data={healthData}
      />

      <Card
        title={`userService.getAllUsers({ page: 0, size: 5 })${usersSummary ? ` — ${usersSummary}` : ""}`}
        loading={usersLoading}
        error={usersError}
        data={usersData}
      />

      <Card
        title={`taskService.getAllTasks({ page: 0, size: 5 })${tasksSummary ? ` — ${tasksSummary}` : ""}`}
        loading={tasksLoading}
        error={tasksError}
        data={tasksData}
      />
    </div>
  );
}
