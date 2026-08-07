"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const shouldMock =
      process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
      (process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_USE_MOCKS !== "false");

    void (async () => {
      try {
        if (shouldMock) {
          const { initMocks } = await import("../lib/mocks");
          await initMocks();
        }
      } catch (err) {
        console.error("MSW failed to start", err);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}