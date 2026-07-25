import { expect, test } from "@playwright/test";

test.describe("CollectorDex login", () => {
  test("demo credentials reach the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("demo@collectordex.local");
    await page.getByLabel(/contraseña/i).fill("collectordex");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/\d+ de 38/i)).toBeVisible();
  });
});
