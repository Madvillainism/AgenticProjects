const DEMO_PLAN = {
  ingreso: 50000,
  gastos_fijos: 15000,
  meta_ahorro: 10000,
  pilares: {
    Necesidades: 12500,
    Deseos: 5000,
    Cultura: 3750,
    Imprevistos: 3750,
  },
};

const DEMO_GASTOS = [
  { fecha: "2026-07-05", categoria: "Necesidades", monto: 3200, descripcion: "Supermercado semanal" },
  { fecha: "2026-07-03", categoria: "Necesidades", monto: 1800, descripcion: "Gasolina" },
  { fecha: "2026-07-06", categoria: "Deseos", monto: 1200, descripcion: "Cena con amigos" },
  { fecha: "2026-07-02", categoria: "Deseos", monto: 2500, descripcion: "Ropa nueva" },
  { fecha: "2026-07-04", categoria: "Cultura", monto: 800, descripcion: "Libro: Hábitos Atómicos" },
  { fecha: "2026-07-01", categoria: "Cultura", monto: 450, descripcion: "Entrada museo" },
  { fecha: "2026-07-07", categoria: "Imprevistos", monto: 1500, descripcion: "Reparación auto" },
  { fecha: "2026-07-07", categoria: "Imprevistos", monto: 600, descripcion: "Farmacia" },
  { fecha: "2026-07-03", categoria: "Necesidades", monto: 2200, descripcion: "Servicio agua" },
  { fecha: "2026-07-06", categoria: "Deseos", monto: 350, descripcion: "Café especial" },
];

const DEMO_REFLEXION = {
  aprendizaje: "Descubrí que mis gastos en deseos son más altos de lo que pensaba. Necesito establecer un límite semanal.",
  mejora: "Reducir salidas a comer fuera y planificar mejor el supermercado para evitar compras impulsivas.",
  cumplio_meta: true,
};

function generarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function seedDemoData() {
  if (localStorage.getItem("kakeibo-plan")) return;

  const planData = {
    ...DEMO_PLAN,
    dinero_disponible: DEMO_PLAN.ingreso - DEMO_PLAN.gastos_fijos,
    dinero_gastar: DEMO_PLAN.ingreso - DEMO_PLAN.gastos_fijos - DEMO_PLAN.meta_ahorro,
  };
  localStorage.setItem("kakeibo-plan", JSON.stringify(planData));

  const gastos = DEMO_GASTOS.map((g) => ({
    ...g,
    id: generarId(),
  }));
  localStorage.setItem("kakeibo-gastos", JSON.stringify(gastos));

  localStorage.setItem("kakeibo-reflexion-aprendizaje", DEMO_REFLEXION.aprendizaje);
  localStorage.setItem("kakeibo-reflexion-mejora", DEMO_REFLEXION.mejora);
  localStorage.setItem("kakeibo-reflexion-meta", DEMO_REFLEXION.cumplio_meta);
}
