import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/correo/i).fill("demo@collectordex.local");
  await page.getByLabel(/contraseña/i).fill("collectordex");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("CollectorDex catalog", () => {
  test("filters via URL search params and opens edition detail", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/catalog?q=Soul&generation=4&status=wishlist&view=list");
    await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
    await expect(page.getByText(/SoulSilver/i).first()).toBeVisible();
    await expect(page).toHaveURL(/q=Soul/);
    await expect(page).toHaveURL(/generation=4/);
    await expect(page).toHaveURL(/status=wishlist/);

    await page.getByRole("link", { name: /SoulSilver/i }).first().click();
    await expect(page).toHaveURL(/\/catalog\/soulsilver-pal-es$/);
    await expect(
      page.getByRole("heading", { name: /SoulSilver/i }),
    ).toBeVisible();
    await expect(page.getByText(/Componentes esperados/i)).toBeVisible();
    await expect(page.getByText(/Pokéwalker/i).first()).toBeVisible();
  });

  test("dashboard shows generation and platform sections", async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Progreso por generación/i)).toBeVisible();
    await expect(page.getByText(/Distribución por plataforma/i)).toBeVisible();
    await expect(page.getByText(/\d+ de 38/i)).toBeVisible();
  });
});
