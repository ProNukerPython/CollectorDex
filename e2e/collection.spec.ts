import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/correo/i).fill("demo@collectordex.local");
  await page.getByLabel(/contraseña/i).fill("collectordex");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("CollectorDex collection CRUD", () => {
  test("add SoulSilver copy with components and mark primary", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/catalog/soulsilver-pal-es");
    await expect(
      page.getByRole("heading", { name: /SoulSilver/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /Añadir copia/i }).click();
    await expect(page).toHaveURL(/\/collection\/new/);

    await page.locator("#condition").selectOption("VERY_GOOD");
    await page.locator("#authenticity").selectOption("PROBABLY_AUTHENTIC");
    await page.locator("#pricePaidEuros").fill("410");
    await page.locator("#estimatedValueEuros").fill("450");
    await page.locator("#purchasedAt").fill("2025-03-01");

    // Mark cartridge, box-like and pokewalker as present
    const selects = page.locator("select[id^='presence_']");
    const count = await selects.count();
    expect(count).toBeGreaterThan(3);

    for (let index = 0; index < count; index += 1) {
      const select = selects.nth(index);
      const label = await select.locator("xpath=ancestor::li[1]").innerText();
      if (
        /Cartucho|Caja|Pokéwalker/i.test(label) &&
        !/Clip|Manual del Pokéwalker/i.test(label)
      ) {
        await select.selectOption("PRESENT");
      }
    }

    await page.getByRole("checkbox", { name: /principal/i }).check();
    await page.getByRole("button", { name: /Guardar copia/i }).click();

    await expect(page).toHaveURL(/\/collection\/[0-9a-f-]+$/i);
    await expect(page.getByText(/Completitud/i).first()).toBeVisible();
    await expect(page.getByText(/%/).first()).toBeVisible();

    await page.getByRole("link", { name: /^Editar$/i }).click();
    await expect(page).toHaveURL(/\/edit$/);

    // Add/mark another component present (manual)
    const editSelects = page.locator("select[id^='presence_']");
    const editCount = await editSelects.count();
    for (let index = 0; index < editCount; index += 1) {
      const select = editSelects.nth(index);
      const label = await select.locator("xpath=ancestor::li[1]").innerText();
      if (/^Manual\b/i.test(label.split("\n")[0] ?? "")) {
        await select.selectOption("PRESENT");
      }
    }

    await page.getByRole("checkbox", { name: /principal/i }).check();
    await page.getByRole("button", { name: /Guardar cambios/i }).click();
    await expect(page).toHaveURL(/\/collection\/[0-9a-f-]+$/i);
    await expect(page.getByText(/Principal/i).first()).toBeVisible();

    await page.goto("/collection");
    await expect(page.getByRole("heading", { name: /Mi colección/i })).toBeVisible();
    await expect(page.getByText(/SoulSilver/i).first()).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    // Progress should include SoulSilver now (>= 13 owned editions)
    await expect(page.getByText(/\d+ de 38/i).first()).toBeVisible();
  });
});
