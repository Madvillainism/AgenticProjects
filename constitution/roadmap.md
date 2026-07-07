# Roadmap de Desarrollo - Kakeibo App

### 📍 Fase 1: Arquitectura de Datos y Ciclo Mensual (MVP)

- [ ] Configurar el archivo de base de datos SQLite inicial.
- [ ] Implementar la lógica del "Ciclo de Inicio de Mes" (Ingreso Inicial - Gastos Fijos - Meta de Ahorro = Dinero Disponible).
- [ ] Crear el diccionario de los 4 pilares de gastos del Kakeibo.

### 📍 Fase 2: Registro Diario y Clasificación Consciente

- [ ] Desarrollar el módulo de inserción de gastos manual diario.
- [ ] Implementar el sistema de validación que obliga a asignar una categoría y una nota de conciencia a cada gasto.
- [ ] Crear consultas en SQLite que extraigan el acumulado por categoría filtrando directamente sobre el JSON.

### 📍 Fase 3: El Módulo de Reflexión (Análisis de Cierre)

- [ ] Diseñar el formulario de "Fin de Mes" con las 4 preguntas tradicionales de Kakeibo.
- [ ] Desarrollar una vista de balance que compare el ahorro prometido al inicio del mes contra el ahorro real alcanzado.
