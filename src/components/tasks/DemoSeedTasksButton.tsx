"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/api/taskService";
import { DEFAULT_PAGE_SIZE, taskKeys } from "@/hooks/useTasksQuery";
import type { CreateTaskRequest } from "@/lib/model/createTaskRequest";

/** Enough rows for two pages at the default page size (5). */
export const DEMO_SEED_COUNT = DEFAULT_PAGE_SIZE * 2;

const DEMO_PREFIX = "[Demo]";

const TITLE_SNIPPETS = [
  "Review pull request",
  "Write release notes",
  "Fix flaky test",
  "Update README",
  "Pair on design review",
  "Triage inbox",
  "Sketch API sketch",
  "Polish empty state",
  "Check CORS config",
  "Smoke deploy checklist",
];

function demoTaskBody(index: number): CreateTaskRequest {
  const n = index + 1;
  const snippet = TITLE_SNIPPETS[index % TITLE_SNIPPETS.length];
  // Spread due dates so date-range filter still has something to show
  const day = String((index % 27) + 1).padStart(2, "0");
  return {
    title: `${DEMO_PREFIX} ${n}: ${snippet}`,
    description: `Sample task for pagination demo (${n} of ${DEMO_SEED_COUNT}). Safe to delete.`,
    dueDate: index % 2 === 0 ? `2026-08-${day}` : null,
    completed: index % 3 === 0,
  };
}

type Props = {
  onSeeded: () => void;
};

/**
 * Demo-only control: bulk-creates sample tasks via existing create API
 * so recruiters can see multi-page lists without manual data entry.
 */
export function DemoSeedTasksButton({ onSeeded }: Props) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    const ok = window.confirm(
      `Create ${DEMO_SEED_COUNT} sample tasks titled “${DEMO_PREFIX} …”?\n\n` +
        `This fills about two pages at the default page size (${DEFAULT_PAGE_SIZE}) so you can try pagination. ` +
        `Tasks are saved on your account — delete them anytime.`
    );
    if (!ok) return;

    setError(null);
    setBusy(true);
    setProgress(0);

    try {
      for (let i = 0; i < DEMO_SEED_COUNT; i++) {
        const [data, err] = await taskService.createTask(demoTaskBody(i));
        if (err || !data) {
          throw new Error(err ?? `Failed creating demo task ${i + 1}`);
        }
        setProgress(i + 1);
      }
      await qc.invalidateQueries({ queryKey: taskKeys.all });
      onSeeded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo seed failed");
      // Still refresh so partial seeds are visible
      void qc.invalidateQueries({ queryKey: taskKeys.all });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-dashed border-amber-300/80 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
        Demo tools
      </p>
      <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
        Showcase pagination without typing: adds {DEMO_SEED_COUNT} sample tasks
        (about two pages at {DEFAULT_PAGE_SIZE} per page). Titles start with{" "}
        <span className="font-mono text-xs">{DEMO_PREFIX}</span>.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
        className="mt-3 rounded-md border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-zinc-950 dark:text-amber-100 dark:hover:bg-amber-950/50"
      >
        {busy && progress != null
          ? `Creating ${progress}/${DEMO_SEED_COUNT}…`
          : `Add ${DEMO_SEED_COUNT} demo tasks (shows pagination)`}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
