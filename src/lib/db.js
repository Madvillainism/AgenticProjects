import Dexie from "dexie";

const db = new Dexie("KakeiboDB");

db.version(1).stores({
  monthlyCycles: "++id, mes, anio",
  dailyEntries: "++id, mes, anio, categoria",
  reflectionEntries: "++id, mes, anio",
  archivedMonths: "++id",
});

db.open();

function getCurrentPeriod() {
  const ahora = new Date();
  return { mes: ahora.getMonth() + 1, anio: ahora.getFullYear() };
}

// --- localStorage sync helpers ---

function syncPlanToLocal(record) {
  if (!record) return;
  localStorage.setItem("kakeibo-plan", JSON.stringify({
    ingreso: record.ingreso,
    gastos_fijos: record.gastos_fijos,
    meta_ahorro: record.meta_ahorro,
    dinero_disponible: record.dinero_disponible,
    dinero_gastar: record.dinero_gastar,
    pilares: record.pilares || {},
    meta_data: record.meta_data || {},
  }));
}

function syncEntriesToLocal(mes, anio) {
  getEntries(mes, anio).then(function(entries) {
    const mapped = entries.map(function(e) {
      return {
        id: e.id,
        fecha: e.fecha,
        categoria: e.categoria,
        monto: e.monto,
        descripcion: e.descripcion,
      };
    });
    localStorage.setItem("kakeibo-gastos", JSON.stringify(mapped));
  });
}

function syncReflectionToLocal(record) {
  if (!record) return;
  localStorage.setItem("kakeibo-reflexion-aprendizaje", record.nota_aprendizaje || "");
  localStorage.setItem("kakeibo-reflexion-mejora", record.nota_mejora || "");
  localStorage.setItem("kakeibo-reflexion-meta", record.cumplio_meta ? "true" : "false");
}

// --- Plan ---

export async function getPlan(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  return db.monthlyCycles
    .where({ mes: period.mes, anio: period.anio })
    .first();
}

export async function savePlan(mes, anio, data) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const existing = await db.monthlyCycles
    .where({ mes: period.mes, anio: period.anio })
    .first();
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
  if (existing) {
    await db.monthlyCycles.update(existing.id, record);
    syncPlanToLocal(record);
    return existing.id;
  } else {
    record.created_at = new Date().toISOString();
    const id = await db.monthlyCycles.add(record);
    syncPlanToLocal(record);
    return id;
  }
}

// --- Gastos ---

export async function getEntries(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  return db.dailyEntries
    .where({ mes: period.mes, anio: period.anio })
    .toArray();
}

export async function addEntry(entry) {
  const period = getCurrentPeriod();
  const record = {
    mes: period.mes,
    anio: period.anio,
    fecha: entry.fecha,
    categoria: entry.categoria,
    monto: entry.monto,
    descripcion: entry.descripcion || "",
    created_at: new Date().toISOString(),
  };
  return db.dailyEntries.add(record).then(function(id) {
    syncEntriesToLocal();
    return id;
  });
}

export async function deleteEntry(id) {
  return db.dailyEntries.delete(id).then(function() {
    syncEntriesToLocal();
  });
}

// --- Reflexión ---

export async function getReflection(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  return db.reflectionEntries
    .where({ mes: period.mes, anio: period.anio })
    .first();
}

export async function saveReflection(mes, anio, data) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const existing = await db.reflectionEntries
    .where({ mes: period.mes, anio: period.anio })
    .first();
  const record = {
    mes: period.mes,
    anio: period.anio,
    nota_aprendizaje: data.aprendizaje || "",
    nota_mejora: data.mejora || "",
    cumplio_meta: data.cumplio_meta ? 1 : 0,
    archivado: data.archivado || 0,
    updated_at: new Date().toISOString(),
  };
  if (existing) {
    await db.reflectionEntries.update(existing.id, record);
    syncReflectionToLocal(record);
    return existing.id;
  } else {
    record.created_at = new Date().toISOString();
    const id = await db.reflectionEntries.add(record);
    syncReflectionToLocal(record);
    return id;
  }
}

// --- Archivar ---

export async function archiveMonth(mes, anio) {
  const period = mes != null ? { mes, anio } : getCurrentPeriod();
  const plan = await getPlan(period.mes, period.anio);
  const entries = await getEntries(period.mes, period.anio);
  const reflection = await getReflection(period.mes, period.anio);

  const snapshot = {
    mes: period.mes,
    anio: period.anio,
    archivado_en: new Date().toISOString(),
    plan: plan || {},
    gastos: entries || [],
    reflexion: reflection
      ? {
          aprendizaje: reflection.nota_aprendizaje,
          mejora: reflection.nota_mejora,
          cumplio_meta: !!reflection.cumplio_meta,
        }
      : {},
  };

  await db.archivedMonths.add(snapshot);

  // Clean up current period
  if (plan) await db.monthlyCycles.delete(plan.id);
  for (const e of entries) {
    await db.dailyEntries.delete(e.id);
  }
  if (reflection) await db.reflectionEntries.delete(reflection.id);

  // Also clear localStorage for the current period
  localStorage.removeItem("kakeibo-plan");
  localStorage.removeItem("kakeibo-gastos");
  localStorage.removeItem("kakeibo-reflexion-aprendizaje");
  localStorage.removeItem("kakeibo-reflexion-mejora");
  localStorage.removeItem("kakeibo-reflexion-meta");

  // Update archived list in localStorage
  const allArchived = await getArchivedMonths();
  localStorage.setItem("kakeibo-archived-meses", JSON.stringify(allArchived));

  return snapshot;
}

export async function getArchivedMonths() {
  return db.archivedMonths.toArray();
}

// --- Migración desde localStorage ---

export async function migrateFromLocalStorage() {
  const count = await db.monthlyCycles.count();
  if (count > 0) return; // already migrated

  const planStr = localStorage.getItem("kakeibo-plan");
  const gastosStr = localStorage.getItem("kakeibo-gastos");
  const archivedStr = localStorage.getItem("kakeibo-archived-meses");

  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  if (planStr) {
    const plan = JSON.parse(planStr);
    await savePlan(mes, anio, plan);
  }

  if (gastosStr) {
    const gastos = JSON.parse(gastosStr);
    for (const g of gastos) {
      await addEntry({
        fecha: g.fecha,
        categoria: g.categoria,
        monto: g.monto,
        descripcion: g.descripcion,
      });
    }
  }

  const aprendizaje = localStorage.getItem("kakeibo-reflexion-aprendizaje");
  const mejora = localStorage.getItem("kakeibo-reflexion-mejora");
  const meta = localStorage.getItem("kakeibo-reflexion-meta");
  if (aprendizaje || mejora) {
    await saveReflection(mes, anio, {
      aprendizaje,
      mejora,
      cumplio_meta: meta === "true",
    });
  }

  if (archivedStr) {
    const archived = JSON.parse(archivedStr);
    for (const a of archived) {
      await db.archivedMonths.add(a);
    }
  }
}

export default db;
