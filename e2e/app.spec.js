import { test, expect } from "@playwright/test";

// Helper to navigate first, then clear localStorage
async function cleanStart(page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// ─── Test 1: Home page renders with 4 summary cards ───
test("Test 1: Home page loads with all 4 summary cards", async ({ page }) => {
  await cleanStart(page);
  await page.goto("/");

  const cards = page.locator(".card");
  await expect(cards).toHaveCount(4);

  // Check card headers exist
  await expect(page.locator(".card-header h2")).toHaveText([
    "INGRESOS",
    "GASTOS",
    "BALANCE",
    "PLANIFICADO",
  ]);

  // Check amounts are formatted as currency
  const amounts = page.locator(".card-amount");
  const count = await amounts.count();
  for (let i = 0; i < count; i++) {
    await expect(amounts.nth(i)).toContainText("$");
  }
});

// ─── Test 2: Demo data seeds on first visit ───
test("Test 2: Demo data is seeded on first visit", async ({ page }) => {
  await cleanStart(page);
  await page.goto("/");

  // After page load, demo data should exist in localStorage
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).not.toBeNull();
  const parsed = JSON.parse(plan);
  expect(parsed.ingreso).toBe(50000);
  expect(parsed.pilares.Necesidades).toBe(12500);

  const gastos = await page.evaluate(() => localStorage.getItem("kakeibo-gastos"));
  expect(gastos).not.toBeNull();
  const parsedGastos = JSON.parse(gastos);
  expect(parsedGastos.length).toBeGreaterThanOrEqual(10);

  // Home page should show income in the first card
  const firstAmount = page.locator(".card-amount").first();
  await expect(firstAmount).toContainText("50000");

  // Monthly breakdown section should be visible
  const breakdown = page.locator("#breakdown-content");
  await expect(breakdown).toHaveClass(/visible/);

  // Recent expenses table should have rows
  const recentRows = page.locator("#recent-tbody tr");
  expect(await recentRows.count()).toBeGreaterThan(0);
});

// ─── Test 3: Adding an expense works ───
test("Test 3: Add expense via gastos form", async ({ page }) => {
  await cleanStart(page);

  // First seed demo data so plan exists for the test
  await page.goto("/");
  await page.waitForTimeout(500);

  // Navigate to gastos page
  await page.goto("/gastos");
  await page.waitForTimeout(500);

  // Fill the expense form
  await page.fill("#exp-fecha", "2026-07-15");
  await page.selectOption("#exp-categoria", "Deseos");
  await page.fill("#exp-monto", "850");
  await page.fill("#exp-descripcion", "Cena sushi");

  // Submit
  await page.click("button[type='submit']");
  await page.waitForTimeout(500);

  // Check the expense table shows the new entry
  const tbody = page.locator("#expense-tbody");
  await expect(tbody).toContainText("Cena sushi");
  await expect(tbody).toContainText("850");

  // Verify localStorage was updated
  const gastos = await page.evaluate(() => localStorage.getItem("kakeibo-gastos"));
  const parsed = JSON.parse(gastos);
  const found = parsed.some((g) => g.descripcion === "Cena sushi" && g.monto === 850);
  expect(found).toBe(true);
});

// ─── Test 4: Plan form saves and calculates correctly ───
test("Test 4: Plan form saves and calculates correctly", async ({ page }) => {
  await cleanStart(page);
  await page.goto("/plan");
  await page.waitForTimeout(500);

  // Fill in plan values
  await page.fill("#ingreso", "60000");
  await page.fill("#gastos-fijos", "20000");
  await page.fill("#meta-ahorro", "10000");

  // Available should be 60000 - 20000 = 40000
  // To spend should be 40000 - 10000 = 30000
  const disponible = page.locator("#dinero-disponible");
  await expect(disponible).toContainText("40000");

  const gastar = page.locator("#dinero-gastar");
  await expect(gastar).toContainText("30000");

  // Fill pillar values
  await page.fill("#pilar-necesidades", "12000");
  await page.fill("#pilar-deseos", "8000");
  await page.fill("#pilar-cultura", "5000");
  await page.fill("#pilar-imprevistos", "5000");

  // Suma should be 30000
  const suma = page.locator("#suma-pilares");
  await expect(suma).toContainText("30000");

  // Submit the form
  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  // Verify saved to localStorage
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).not.toBeNull();
  const parsed = JSON.parse(plan);
  expect(parsed.ingreso).toBe(60000);
  expect(parsed.dinero_disponible).toBe(40000);
  expect(parsed.dinero_gastar).toBe(30000);
  expect(parsed.pilares.Necesidades).toBe(12000);
});

// ─── Test 5: Archiving a month works ───
test("Test 5: Archive month from reflexion page", async ({ page }) => {
  await cleanStart(page);

  // Seed demo data
  await page.goto("/");
  await page.waitForTimeout(500);

  // Go to reflexion page
  await page.goto("/reflexion");
  await page.waitForTimeout(500);

  // Fill reflexion textareas
  const ap = page.locator("#ref-aprendizaje");
  await ap.fill("Aprendí a controlar mis gastos en deseos");
  const me = page.locator("#ref-mejora");
  await me.fill("Reducir salidas a comer fuera");

  // Check the meta checkbox
  await page.locator("#ref-meta").check();

  // Button should now be enabled
  const btn = page.locator("#btn-archivar");
  await expect(btn).not.toBeDisabled();

  // Click archive
  await btn.click();
  await page.waitForTimeout(500);

  // After archiving, the journal should show the empty state
  const journalEmpty = page.locator("#journal-empty");
  await expect(journalEmpty).toContainText("Mes archivado correctamente");

  // localStorage should have the archived month
  const archived = await page.evaluate(() =>
    localStorage.getItem("kakeibo-archived-meses")
  );
  expect(archived).not.toBeNull();
  const parsed = JSON.parse(archived);
  expect(parsed.length).toBe(1);
  expect(parsed[0].reflexion.aprendizaje).toContain("gastos en deseos");

  // Current plan should be removed
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).toBeNull();

  // Archived list should show on home page
  await page.goto("/");
  await page.waitForTimeout(500);
  const archivedSection = page.locator("#archived-list");
  await expect(archivedSection).toContainText("Julio");
});
