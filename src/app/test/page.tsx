'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">API Health Check</h1>

      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Endpoint: /api/health</h2>

        {loading && (
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

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {!!data && (
          <div className="bg-zinc-50 dark:bg-black p-4 rounded overflow-auto">
            <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

