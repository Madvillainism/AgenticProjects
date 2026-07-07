# SQLite Database — Especificación

## Propósito
Persistencia local de todos los datos de la aplicación: planes mensuales, gastos diarios y reflexiones.

## Runtime (por definir)
- **Electron** → `better-sqlite3` (síncrono, rápido)
- **Tauri** → `tauri-plugin-sql` (SQLite vía Rust)
- **Web** → `sql.js` (SQLite compilado a WASM)

## Esquema

```sql
CREATE TABLE monthly_cycles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    mes         INTEGER NOT NULL CHECK(mes BETWEEN 1 AND 12),
    anio        INTEGER NOT NULL CHECK(anio >= 2024),
    ingreso     REAL    NOT NULL CHECK(ingreso > 0),
    gastos_fijos REAL   NOT NULL DEFAULT 0 CHECK(gastos_fijos >= 0),
    meta_ahorro REAL    NOT NULL DEFAULT 0 CHECK(meta_ahorro >= 0),
    pilares     TEXT    NOT NULL DEFAULT '{}',
    meta_data   TEXT    NOT NULL DEFAULT '{}',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(mes, anio)
);

CREATE TABLE daily_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    mes         INTEGER NOT NULL,
    anio        INTEGER NOT NULL,
    fecha       TEXT    NOT NULL,
    categoria   TEXT    NOT NULL CHECK(categoria IN ('Necesidades','Deseos','Cultura','Imprevistos')),
    monto       REAL    NOT NULL CHECK(monto > 0),
    descripcion TEXT    DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (mes, anio) REFERENCES monthly_cycles(mes, anio)
);

CREATE TABLE reflection_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    mes           INTEGER NOT NULL,
    anio          INTEGER NOT NULL,
    nota_aprendizaje TEXT DEFAULT '',
    nota_mejora   TEXT    DEFAULT '',
    cumplio_meta  INTEGER DEFAULT 0,
    archivado     INTEGER DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(mes, anio)
);
```

## API (`src/lib/db.ts`)
```typescript
// Plan
getPlan(mes: number, anio: number): MonthlyCycle | null
savePlan(mes: number, anio: number, data: PlanData): void

// Gastos
getEntries(mes: number, anio: number): DailyEntry[]
addEntry(entry: NewEntry): void
deleteEntry(id: number): void

// Reflexión
getReflection(mes: number, anio: number): ReflectionEntry | null
saveReflection(mes: number, anio: number, data: ReflectionData): void
archiveMonth(mes: number, anio: number): void
```

## Migraciones
- `src/db/migrations/001_initial.sql`
- Cada migración es un archivo SQL versionado
