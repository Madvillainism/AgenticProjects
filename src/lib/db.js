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

export function getReflection() {
  const raw = localStorage.getItem("kakeibo-reflexion");
  return safeParse(raw, null);
}

export async function saveReflection(data) {
  const record = {
    texto: data.texto || "",
    ingreso: data.ingreso || 0,
    gastos: data.gastos || 0,
    balance: data.balance || 0,
    cerrado_en: new Date().toISOString(),
  };
  localStorage.setItem("kakeibo-reflexion", JSON.stringify(record));
}

// --- Cerrar mes ---

export async function closeMonth(texto) {
  const plan = getPlan();
  const entries = safeParse(localStorage.getItem("kakeibo-gastos"), []);
  const totalGastos = entries.reduce(function(s, g) { return s + g.monto; }, 0);
  const ingreso = plan ? plan.ingreso || 0 : 0;
  const balance = ingreso - totalGastos;

  await saveReflection({ texto, ingreso, gastos: totalGastos, balance });

  localStorage.removeItem("kakeibo-plan");
  localStorage.removeItem("kakeibo-gastos");

  return { texto, ingreso, gastos: totalGastos, balance };
}
