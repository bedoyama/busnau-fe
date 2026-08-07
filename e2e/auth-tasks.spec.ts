import { expect, test } from "@playwright/test";

/**
 * Mock-mode smoke: MSW is on by default in `pnpm dev`.
 * No busnau-api / Postgres required.
 */
test.describe("auth + tasks (MSW)", () => {
  test("login and create a task", async ({ page }) => {
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

    const title = `E2E task ${Date.now()}`;
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page.getByRole("button", { name: "Add task" }).click();

    await expect(page.getByRole("cell", { name: title, exact: true })).toBeVisible();
  });

  test("guest cannot open tasks", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login/);
  });
});
