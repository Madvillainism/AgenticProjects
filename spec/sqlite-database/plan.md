# SQLite Database — Plan de Implementación

## Fase 1: Definir runtime
- Decidir si la app corre en Electron, Tauri o web
- Esto determina la librería SQLite

## Fase 2: Crear esquema
- Escribir `src/db/schema.sql`
- Crear `src/db/migrate.js` para ejecutar migraciones

## Fase 3: Capa de datos
- Crear `src/lib/db.ts` con todas las funciones CRUD
- Cada función ejecuta SQL crudo

## Fase 4: Integrar en UI
- Reemplazar arrays en memoria por llamadas a DB
- PlanForm → db.savePlan()
- ExpenseForm → db.addEntry()
- ExpenseTable → db.getEntries()
- Reflection → db.saveReflection()

## Fase 5: Verificar
- Persistencia entre recargas
- Datos correctos en todas las vistas
