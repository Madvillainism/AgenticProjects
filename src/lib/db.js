function getCurrentPeriod() {
  const ahora = new Date();
  return { mes: ahora.getMonth() + 1, anio: ahora.getFullYear() };
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch(e) { return fallback; }
}

// --- Plan ---

export function getPlan(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const raw = localStorage.getItem("kakeibo-plan");
  return safeParse(raw, null);
}

export async function savePlan(mes, anio, data) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const record = {
    mes: period.mes,
    anio: period.anio,
    ingreso: data.ingreso || 0,
    gastos_fijos: data.gastos_fijos || 0,
    meta_ahorro: data.meta_ahorro || 0,
    dinero_disponible: data.dinero_disponible || 0,
    dinero_gastar: data.dinero_gastar || 0,
    pilares: data.pilares || {},
    meta_data: data.meta_data || {},
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem("kakeibo-plan", JSON.stringify(record));
}

// --- Gastos ---

export function getEntries(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const raw = localStorage.getItem("kakeibo-gastos");
  const entries = safeParse(raw, []);
  return entries.filter(function(e) {
    return e.mes === period.mes && e.anio === period.anio;
  });
}

export async function addEntry(entry) {
  const period = getCurrentPeriod();
  const raw = localStorage.getItem("kakeibo-gastos");
  const entries = safeParse(raw, []);
  const maxId = entries.reduce(function(max, e) { return e.id > max ? e.id : max; }, 0);
  const record = {
    id: maxId + 1,
    mes: period.mes,
    anio: period.anio,
    fecha: entry.fecha,
    categoria: entry.categoria,
    monto: entry.monto,
    descripcion: entry.descripcion || "",
    created_at: new Date().toISOString(),
  };
  entries.push(record);
  localStorage.setItem("kakeibo-gastos", JSON.stringify(entries));
  return record.id;
}

export async function deleteEntry(id) {
  const raw = localStorage.getItem("kakeibo-gastos");
  const entries = safeParse(raw, []);
  const filtered = entries.filter(function(e) { return e.id !== id; });
  localStorage.setItem("kakeibo-gastos", JSON.stringify(filtered));
}

// --- Reflexión ---

export function getReflection(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const aprendizaje = localStorage.getItem("kakeibo-reflexion-aprendizaje") || "";
  const mejora = localStorage.getItem("kakeibo-reflexion-mejora") || "";
  const meta = localStorage.getItem("kakeibo-reflexion-meta");
  return {
    mes: period.mes,
    anio: period.anio,
    nota_aprendizaje: aprendizaje,
    nota_mejora: mejora,
    cumplio_meta: meta === "true" ? 1 : 0,
  };
}

export async function saveReflection(mes, anio, data) {
  localStorage.setItem("kakeibo-reflexion-aprendizaje", data.aprendizaje || "");
  localStorage.setItem("kakeibo-reflexion-mejora", data.mejora || "");
  localStorage.setItem("kakeibo-reflexion-meta", data.cumplio_meta ? "true" : "false");
}

// --- Archivar ---

export async function archiveMonth(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const plan = getPlan(period.mes, period.anio);
  const entries = getEntries(period.mes, period.anio);
  const reflection = getReflection(period.mes, period.anio);

  const snapshot = {
    mes: period.mes,
    anio: period.anio,
    archivado_en: new Date().toISOString(),
    plan: plan || {},
    gastos: entries || [],
    reflexion: {
      aprendizaje: reflection.nota_aprendizaje || "",
      mejora: reflection.nota_mejora || "",
      cumplio_meta: !!reflection.cumplio_meta,
    },
  };

  const raw = localStorage.getItem("kakeibo-archived-meses");
  const archived = safeParse(raw, []);
  snapshot.id = archived.length > 0
    ? archived.reduce(function(m, a) { return (a.id || 0) > m ? a.id : m; }, 0) + 1
    : 1;
  archived.push(snapshot);
  localStorage.setItem("kakeibo-archived-meses", JSON.stringify(archived));

  // Clean up current period
  localStorage.removeItem("kakeibo-plan");
  localStorage.removeItem("kakeibo-gastos");
  localStorage.removeItem("kakeibo-reflexion-aprendizaje");
  localStorage.removeItem("kakeibo-reflexion-mejora");
  localStorage.removeItem("kakeibo-reflexion-meta");

  return snapshot;
}

export function getArchivedMonths() {
  const raw = localStorage.getItem("kakeibo-archived-meses");
  return safeParse(raw, []);
}
