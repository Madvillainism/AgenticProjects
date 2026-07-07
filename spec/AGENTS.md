# Kakeibo App - Multi-Agent Registry

Este archivo define los roles y las habilidades de las IAs encargadas de levantar la aplicación.

## 👥 Perfiles de Agentes Autorizados

### 1. 🏯 `Kakeibo-Orchestrator` (Agente Líder)

- **Rol:** Supervisor de flujos y consistencia del método.
- **Responsabilidad:** Asegurar que las interfaces y los modelos de datos respeten los ciclos de planificación mensuales tradicionales del Kakeibo.

### 📊 2. `Ledger-Data-Agent` (Especialista en Persistencia)

- **Rol:** Administrador de la base de datos local.
- **Responsabilidad:** Diseñar el archivo SQLite y gestionar las queries híbridas con campos JSON para almacenar las metas de ahorro y los registros de gastos diarios.

### 🎨 3. `Zen-UI-Agent` (Diseñador de Interfaz)

- **Rol:** Desarrollador Frontend.
- **Responsabilidad:** Crear una interfaz limpia, minimalista y libre de distracciones (Estilo Zen/Japonés contemporáneo) que invite a la reflexión financiera sin abrumar con gráficos financieros saturados.
