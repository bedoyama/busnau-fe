'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  // Health Endpoint State
  const [healthData, setHealthData] = useState<unknown>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Users Endpoint State
  const [usersData, setUsersData] = useState<unknown>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Fetch Health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setHealthData(json);
        setHealthLoading(false);
      })
      .catch((err) => {
        setHealthError(err instanceof Error ? err.message : 'An unknown error occurred');
        setHealthLoading(false);
      });
  }, []);

  // Fetch Users
  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setUsersData(json);
        setUsersLoading(false);
      })
      .catch((err) => {
        setUsersError(err instanceof Error ? err.message : 'An unknown error occurred');
        setUsersLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <h1 className="text-4xl font-bold mb-4">API Handler Tests</h1>

      {/* Health Check Card */}
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Endpoint: /api/health</h2>

        {healthLoading && (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {healthError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error:</span> {healthError}
          </div>
        )}

        {!!healthData && !healthLoading && !healthError && (
          <div className="bg-zinc-50 dark:bg-black p-4 rounded overflow-auto border border-zinc-200 dark:border-zinc-800">
            <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Users Check Card */}
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Endpoint: /api/users</h2>

        {usersLoading && (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        {usersError && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error:</span> {usersError}
          </div>
        )}

        {!!usersData && !usersLoading && !usersError && (
          <div className="bg-zinc-50 dark:bg-black p-4 rounded overflow-auto border border-zinc-200 dark:border-zinc-800 max-h-96">
            <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {JSON.stringify(usersData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
