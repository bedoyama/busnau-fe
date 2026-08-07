import { expect, test } from "@playwright/test";

/**
 * Mock-mode smoke: Playwright starts `pnpm dev` with NEXT_PUBLIC_USE_MOCKS=true.
 * No busnau-api / Postgres required. See docs/LOCAL.md for real-backend smoke.
 */
test.describe("auth + tasks (MSW)", () => {
  test("login and create a task with timestamps", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    // Wait until browser MSW worker is controlling the page
    await page.waitForFunction(() => window.__MSW_READY__ === true, null, {
      timeout: 30_000,
    });

    await page.getByLabel("Username").fill("e2e_user");
    await page.getByLabel("Password").fill("password1");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/tasks/);
    await expect(
      page.getByRole("heading", { name: "Tasks", exact: true })
    ).toBeVisible();

    // plan-v3 TaskResponse: Instant columns on the list
    await expect(page.getByRole("columnheader", { name: "Created" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Updated" })).toBeVisible();

    const title = `E2E task ${Date.now()}`;
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page.getByRole("button", { name: "Add task" }).click();

    await expect(page.getByRole("cell", { name: title, exact: true })).toBeVisible();
  });

  test("date-range filter uses paged list", async ({ page }) => {
    await page.goto("/login");
    await page.waitForFunction(() => window.__MSW_READY__ === true, null, {
      timeout: 30_000,
    });
    await page.getByLabel("Username").fill("e2e_user");
    await page.getByLabel("Password").fill("password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/tasks/);

    // Seed tasks include due dates in 2026-08; filter should keep UI on tasks
    await page.locator("#filter-start").fill("2026-08-01");
    await page.locator("#filter-end").fill("2026-08-31");

    await expect(page.getByRole("heading", { name: "Your tasks" })).toBeVisible();
    // Page chrome still shown (paged date-range, not a single dump)
    await expect(page.getByText(/total · page/i)).toBeVisible();
  });

  test("logout-all from account clears session", async ({ page }) => {
    await page.goto("/login");
    await page.waitForFunction(() => window.__MSW_READY__ === true, null, {
      timeout: 30_000,
    });
    await page.getByLabel("Username").fill("e2e_user");
    await page.getByLabel("Password").fill("password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/tasks/);

    // Client nav keeps React auth state; full reload exercises token → /me bootstrap
    await page.getByRole("link", { name: "Account" }).click();
    await expect(page).toHaveURL(/\/account/);
    await expect(
      page.getByRole("heading", { name: "Sessions" })
    ).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Log out everywhere" }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login/);
  });

  test("guest cannot open tasks", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login/);
  });
});
