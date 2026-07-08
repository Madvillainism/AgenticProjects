import { test, expect } from "@playwright/test";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

async function cleanStart(page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("KakeiboDB");
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// Helper to query IndexedDB directly from the browser
async function dexieCount(page, storeName) {
  return page.evaluate((store) => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("KakeiboDB");
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(store, "readonly");
          const os = tx.objectStore(store);
          const countReq = os.count();
          countReq.onsuccess = () => { db.close(); resolve(countReq.result); };
          countReq.onerror = () => { db.close(); reject(countReq.error); };
        } catch (e) {
          // Store might not exist yet
          db.close();
          resolve(0);
        }
      };
      req.onupgradeneeded = () => resolve(0);
      req.onerror = () => reject(req.error);
    });
  }, storeName);
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
  await expect(page.locator("#archived-empty")).toBeVisible();

  // Dexie should also be empty
  expect(await dexieCount(page, "monthlyCycles")).toBe(0);
  expect(await dexieCount(page, "dailyEntries")).toBe(0);
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

// ─── Test 4: Archive month works ───
test("Test 4: Archive month from reflexion page", async ({ page }) => {
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

  // Archive
  await page.goto("/reflexion");
  await page.waitForTimeout(500);
  await page.locator("#ref-aprendizaje").fill("Aprendí a controlar gastos");
  await page.locator("#ref-mejora").fill("Reducir salidas a comer fuera");
  await page.locator("#ref-meta").check();

  const btn = page.locator("#btn-archivar");
  await expect(btn).not.toBeDisabled();
  await btn.click();
  await page.waitForTimeout(500);

  await expect(page.locator("#journal-empty")).toContainText("Mes archivado correctamente");

  // Current plan removed
  const plan = await page.evaluate(() => localStorage.getItem("kakeibo-plan"));
  expect(plan).toBeNull();

  // Archived month persisted
  const archived = await page.evaluate(() => localStorage.getItem("kakeibo-archived-meses"));
  expect(archived).not.toBeNull();
  const parsed = JSON.parse(archived);
  expect(parsed.length).toBe(1);
  expect(parsed[0].reflexion.aprendizaje).toContain("gastos");

});

// ─── Test 5: PDF button renders in archived months ───
test("Test 5: PDF download button renders in archived month", async ({ page }) => {
  await cleanStart(page);

  // Seed archived data directly
  await page.evaluate(() => {
    const snapshot = {
      id: Date.now(), mes: 7, anio: 2026,
      archivado_en: new Date().toISOString(),
      plan: { ingreso: 50000, gastos_fijos: 15000, meta_ahorro: 10000, dinero_disponible: 35000, dinero_gastar: 25000, pilares: { Necesidades: 10000, Deseos: 5000, Cultura: 5000, Imprevistos: 5000 } },
      gastos: [{ id: 1, fecha: "2026-07-15", categoria: "Deseos", monto: 850, descripcion: "Cena" }],
      reflexion: { aprendizaje: "Test", mejora: "Test", cumplio_meta: true },
    };
    localStorage.setItem("kakeibo-archived-meses", JSON.stringify([snapshot]));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page.waitForTimeout(500);

  await expect(page.locator("#archived-list")).toContainText("Julio");

  // Expand and check button
  await page.locator(".archived-header").click();
  await page.waitForTimeout(300);

  const dlBtn = page.locator(".archived-dl-btn");
  await expect(dlBtn).toBeVisible();
  await expect(dlBtn).toContainText("Descargar PDF");

  const dataAttr = await dlBtn.getAttribute("data-archived");
  expect(dataAttr).not.toBeNull();
  const data = JSON.parse(dataAttr);
  expect(data.plan.ingreso).toBe(50000);
});

// ─── Test 6: Data survives page reload via Dexie ───
test("Test 6: Data persists across reload in Dexie", async ({ page }) => {
  await cleanStart(page);

  // Save data via Dexie's localStorage sync (which also writes to Dexie)
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

  // Reload triggers migrateFromLocalStorage() which copies to Dexie
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page.waitForTimeout(500);

  // Dexie should now have the data
  expect(await dexieCount(page, "monthlyCycles")).toBe(1);
  expect(await dexieCount(page, "dailyEntries")).toBe(1);

  // Home should show the income
  const firstAmount = page.locator(".card-amount").first();
  await expect(firstAmount).toContainText("75000");

  // Now clear localStorage only (simulate Dexie working independently)
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page.waitForTimeout(500);

  // Dexie should still have the data even after localStorage wipe
  // because migrateFromLocalStorage won't re-run (data already in Dexie)
  expect(await dexieCount(page, "monthlyCycles")).toBe(1);
});

// ─── Test 7: Full natural flow ───
test("Test 7: Full natural flow: plan → gastos → archive → verify", async ({ page }) => {
  await cleanStart(page);

  // 1. Start empty
  await page.goto("/");
  await expect(page.locator("#plan-status")).toContainText("Sin plan");

  // 2. Create plan
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

  // 3. Add expenses
  await page.goto("/gastos");
  await page.waitForTimeout(300);
  await page.fill("#exp-fecha", "2026-07-01");
  await page.selectOption("#exp-categoria", "Necesidades");
  await page.fill("#exp-monto", "2500");
  await page.fill("#exp-descripcion", "Mercado mensual");
  await page.click("button[type='submit']");
  await page.waitForTimeout(500);

  await page.fill("#exp-fecha", "2026-07-05");
  await page.selectOption("#exp-categoria", "Deseos");
  await page.fill("#exp-monto", "1200");
  await page.fill("#exp-descripcion", "Cine + cena");
  await page.click("button[type='submit']");
  await page.waitForTimeout(300);

  // 4. Archive
  await page.goto("/reflexion");
  await page.waitForTimeout(500);
  await page.locator("#ref-aprendizaje").fill("Gasté menos en deseos de lo planeado");
  await page.locator("#ref-mejora").fill("Mantener el hábito de registrar gastos");
  await page.locator("#ref-meta").check();
  await page.locator("#btn-archivar").click();
  await page.waitForTimeout(500);
  await expect(page.locator("#journal-empty")).toContainText("Mes archivado correctamente");

  // 5. Home should show archived month
  await page.goto("/");
  await page.waitForTimeout(500);
  const archivedSection = page.locator("#archived-list");
  await expect(archivedSection).toContainText(MONTHS[new Date().getMonth()]);

  // 6. Current plan should be reset
  await expect(page.locator("#plan-status")).toContainText("Sin plan");
  const cards = page.locator(".card-amount");
  await expect(cards.first()).toContainText("$0.00");

});
