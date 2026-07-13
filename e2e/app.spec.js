import { test, expect } from "@playwright/test";

async function cleanStart(page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// ─── Test 1: App starts empty ───
test("Test 1: App starts empty on first visit", async ({ page }) => {
  await cleanStart(page);
  await page.goto("/");

  const amounts = page.locator(".card-amount");
  await expect(amounts).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(amounts.nth(i)).toContainText("$0.00");
  }

  await expect(page.locator("#plan-status")).toContainText("Sin plan");
  await expect(page.locator("#breakdown-empty")).toBeVisible();
  await expect(page.locator("#recent-empty")).toBeVisible();
});

// ─── Test 2: Plan form saves and calculates ───
test("Test 2: Plan form saves and calculates correctly", async ({ page }) => {
  await cleanStart(page);
  await page.goto("/plan");
  await page.waitForTimeout(500);

  await page.fill("#ingreso", "60000");
  await page.fill("#gastos-fijos", "20000");
  await page.fill("#meta-ahorro", "10000");

  await expect(page.locator("#dinero-disponible")).toContainText("40000");
  await expect(page.locator("#dinero-gastar")).toContainText("30000");

  await page.fill("#pilar-necesidades", "12000");
  await page.fill("#pilar-deseos", "8000");
  await page.fill("#pilar-cultura", "5000");
  await page.fill("#pilar-imprevistos", "5000");

  await expect(page.locator("#suma-pilares")).toContainText("30000");

  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  // Verify localStorage
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).not.toBeNull();
  const parsed = JSON.parse(plan);
  expect(parsed.ingreso).toBe(60000);
  expect(parsed.dinero_disponible).toBe(40000);
  expect(parsed.dinero_gastar).toBe(30000);
  expect(parsed.pilares.Necesidades).toBe(12000);

});

// ─── Test 3: Adding an expense works ───
test("Test 3: Add expense via gastos form", async ({ page }) => {
  await cleanStart(page);

  // Create plan first
  await page.goto("/plan");
  await page.waitForTimeout(300);
  await page.fill("#ingreso", "50000");
  await page.fill("#gastos-fijos", "15000");
  await page.fill("#meta-ahorro", "10000");
  await page.fill("#pilar-necesidades", "10000");
  await page.fill("#pilar-deseos", "5000");
  await page.fill("#pilar-cultura", "5000");
  await page.fill("#pilar-imprevistos", "5000");
  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  // Add expense
  await page.goto("/gastos");
  await page.waitForTimeout(300);
  await page.fill("#exp-fecha", "2026-07-15");
  await page.selectOption("#exp-categoria", "Deseos");
  await page.fill("#exp-monto", "850");
  await page.fill("#exp-descripcion", "Cena sushi");
  await page.click("button[type='submit']");
  await page.waitForTimeout(500);

  // Verify in table
  await expect(page.locator("#expense-tbody")).toContainText("Cena sushi");
  await expect(page.locator("#expense-tbody")).toContainText("850");

  // Verify localStorage
  const gastos = await page.evaluate(() => localStorage.getItem("kakeibo-gastos"));
  const parsed = JSON.parse(gastos);
  expect(parsed.some((g) => g.descripcion === "Cena sushi" && g.monto === 850)).toBe(true);

});

// ─── Test 4: Close month from reflexion page ───
test("Test 4: Close month from reflexion page", async ({ page }) => {
  await cleanStart(page);

  // Create plan
  await page.goto("/plan");
  await page.waitForTimeout(300);
  await page.fill("#ingreso", "50000");
  await page.fill("#gastos-fijos", "15000");
  await page.fill("#meta-ahorro", "10000");
  await page.fill("#pilar-necesidades", "10000");
  await page.fill("#pilar-deseos", "5000");
  await page.fill("#pilar-cultura", "5000");
  await page.fill("#pilar-imprevistos", "5000");
  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  // Close month
  await page.goto("/reflexion");
  await page.waitForTimeout(2500);
  await page.locator("#ref-texto").fill("Aprendí a controlar gastos este mes");
  await page.locator("#btn-cerrar").click();
  await page.waitForTimeout(500);

  await expect(page.locator("#close-success")).toContainText("Mes cerrado correctamente");

  // Current plan removed
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).toBeNull();

  // Gastos removed
  const gastos = await page.evaluate(() => localStorage.getItem("kakeibo-gastos"));
  expect(gastos).toBeNull();

  // Reflection saved
  const reflexion = await page.evaluate(() => localStorage.getItem("kakeibo-reflexion"));
  expect(reflexion).not.toBeNull();
  const parsed = JSON.parse(reflexion);
  expect(parsed.texto).toContain("gastos");
  expect(parsed.ingreso).toBe(50000);

});

// ─── Test 5: Data persists across reload in localStorage ───
test("Test 5: Data persists across reload in localStorage", async ({ page }) => {
  await cleanStart(page);

  // Save plan and expense
  await page.evaluate(() => {
    localStorage.setItem("kakeibo-plan", JSON.stringify({
      ingreso: 75000, gastos_fijos: 25000, meta_ahorro: 15000,
      dinero_disponible: 50000, dinero_gastar: 35000,
      pilares: { Necesidades: 15000, Deseos: 8000, Cultura: 6000, Imprevistos: 6000 },
    }));
    localStorage.setItem("kakeibo-gastos", JSON.stringify([
      { id: 1, fecha: "2026-07-20", categoria: "Necesidades", monto: 3200, descripcion: "Supermercado" },
    ]));
  });

  // Reload and verify data is still in localStorage
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page.waitForTimeout(500);

  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).not.toBeNull();
  const parsed = JSON.parse(plan);
  expect(parsed.ingreso).toBe(75000);

  // Home should show the income
  const firstAmount = page.locator(".card-amount").first();
  await expect(firstAmount).toContainText("75000");
});

// ─── Test 6: Home shows summary cards after refresh ───
test("Test 6: Home shows summary cards after refresh", async ({ page }) => {
  await cleanStart(page);

  // Create plan + expense
  await page.goto("/plan");
  await page.waitForTimeout(300);
  await page.fill("#ingreso", "45000");
  await page.fill("#gastos-fijos", "12000");
  await page.fill("#meta-ahorro", "8000");
  await page.fill("#pilar-necesidades", "10000");
  await page.fill("#pilar-deseos", "5000");
  await page.fill("#pilar-cultura", "5000");
  await page.fill("#pilar-imprevistos", "5000");
  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  await page.goto("/gastos");
  await page.waitForTimeout(300);
  await page.fill("#exp-fecha", "2026-07-01");
  await page.selectOption("#exp-categoria", "Necesidades");
  await page.fill("#exp-monto", "2500");
  await page.fill("#exp-descripcion", "Mercado mensual");
  await page.click("button[type='submit']");
  await page.waitForTimeout(500);

  // Go to home and verify summary
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator("#plan-status")).toContainText("Plan activo");
  const amounts = page.locator(".card-amount");
  await expect(amounts.first()).toContainText("45000");
});
