# 🏯 Kakeibo — Mindful Personal Finance Ledger

[![Astro](https://img.shields.io/badge/Astro-7.0+-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Database](https://img.shields.io/badge/Database-SQLite_%2B_JSONB-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Cloud_/_Local-0052CC?style=for-the-badge)]()
[![Methodology](https://img.shields.io/badge/Methodology-SSD_Driven-8A2BE2?style=for-the-badge)]()

> **Kakeibo** es un diario financiero digital de código abierto diseñado bajo la filosofía tradicional japonesa de ahorro consciente. A diferencia de las aplicaciones financieras convencionales que automatizan el rastreo, esta herramienta devuelve el control deliberado al usuario, combinando la velocidad y el rendimiento del renderizado moderno con la flexibilidad de un almacenamiento local híbrido.

📁 **Gobernanza del Repositorio:** Proyecto diseñado e implementado bajo el estándar **SSD (Spec-Driven Development)** utilizando el framework de agentes autónomos de código.

---

## 🌸 La Filosofía Kakeibo (The 4 Pillars)

Kakeibo no es solo registrar transacciones; es un ejercicio de minimalismo digital y autoevaluación. El sistema obliga a clasificar cada gasto en uno de los cuatro pilares estrictos del método:

1.  **🏠 Supervivencia (Necesidades):** Gastos indispensables como vivienda, alimentación, salud y transporte.
2.  **🎉 Ocio (Deseos):** Salidas, cenas, pasatiempos y compras por placer.
3.  **📚 Cultura:** Libros, cursos, museos y cualquier inversión en el crecimiento personal.
4.  **⚡ Extras (Imprevistos):** Gastos de emergencia, reparaciones o regalos inesperados.

---

## ✨ Características Técnicas & Funcionales

*   **🔒 Privacidad Absoluta (Zero-Cloud Guardrail):** Tus datos financieros te pertenecen. La aplicación opera de forma 100% local; no cuenta con telemetría, analíticas ni sincronización con servidores externos o APIs en la nube.
*   **🗄️ Persistencia Híbrida Eficiente:** Utiliza un motor relacional embebido **SQLite 3** local. Combina columnas relacionales indexadas rígidas (IDs, timestamps, categorías) con una columna binaria optimizada en formato **JSON (`JSONB`)** para almacenar metas mensuales mutables y las respuestas a las reflexiones del usuario sin lidiar con migraciones pesadas.
*   **⚡ Arquitectura Ultra Rápida (Astro Core):** Desarrollado sobre **Astro**, aprovechando su excelente rendimiento, enrutamiento basado en archivos y la capacidad de cargar interactividad en el cliente únicamente donde es estrictamente necesario.
*   **🔄 Ciclo de Reflexión en 3 Fases:**
    *   *Inicio de Mes:* Declaración de ingresos, deducción automática de gastos fijos y establecimiento de la meta de ahorro ideal.
    *   *Registro Diario:* Inserción manual y consciente de egresos con notas de validación obligatorias.
    *   *Cierre de Mes:* Balance automatizado frente a las 4 preguntas tradicionales de Kakeibo para evaluar el comportamiento financiero.

---

## 📂 Estructura de Especificaciones (SSD Layout)

El ciclo de vida y las reglas operativas de los agentes de software de este proyecto están rígidamente documentados en el directorio `spec/`:

```text
spec/
├── constitution/
│   ├── mision-vision.md      # Enfoque filosófico del minimalismo financiero
│   ├── tech-stack.md         # Bloqueo del entorno (Astro, SQLite, JSON)
│   └── roadmap.md            # Fases incrementales del desarrollo del MVP
├── features/
│   ├── 001-monthly-budget-planner  # Módulo de inicialización e ingresos fijos
│   ├── 002-daily-expense-ledger    # Registro manual diario y consultas JSONB
│   └── 003-mindful-reflection-closer # Algoritmo de cierre y evaluación mensual
├── CONTEXT.md                # Restricciones de código activas y estados globales
└── AGENTS.md                 # Organigrama y asignación de habilidades de los subagentes
