import { expect, test } from "@playwright/test";

test.describe("CollectorDex smoke", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /CollectorDex/i })).toBeVisible();
    await expect(page.getByLabel(/correo/i)).toBeVisible();
  });
});
