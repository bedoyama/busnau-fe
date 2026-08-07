import { defineConfig, devices } from "@playwright/test";

/**
 * E2E against local Next + MSW (default mock mode in development).
 * Starts `pnpm dev` unless something is already on :3000.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    // Dedicated port so a manual `pnpm dev` on :3000 does not block CI/local e2e
    baseURL: "http://localhost:3001",
    // MSW relies on a Service Worker — Playwright blocks them unless allowed
    serviceWorkers: "allow",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev --hostname localhost --port 3001",
    url: "http://localhost:3001",
    // Always start a fresh dev server so MSW / env match this suite
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      // Force mock backend for e2e (do not hit real :8080)
      NEXT_PUBLIC_USE_MOCKS: "true",
      NEXT_PUBLIC_API_URL: "http://localhost:8080",
      // Separate Next build dir so e2e can run while `pnpm dev` holds :3000
      NEXT_DIST_DIR: ".next-e2e",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
