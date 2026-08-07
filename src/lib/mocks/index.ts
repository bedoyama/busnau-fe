declare global {
  interface Window {
    /** Set after browser MSW worker is started (e2e / debugging). */
    __MSW_READY__?: boolean;
  }
}

let browserStart: Promise<void> | null = null;

export async function initMocks() {
  if (typeof window === "undefined") {
    const { server } = await import("./node");
    server.listen({ onUnhandledRequest: "bypass" });
    return;
  }

  if (window.__MSW_READY__) {
    return;
  }

  if (!browserStart) {
    browserStart = (async () => {
      const { worker } = await import("./browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        quiet: true,
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });
      window.__MSW_READY__ = true;
    })();
  }

  await browserStart;
}
