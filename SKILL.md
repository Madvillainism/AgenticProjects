---
name: DeskDog
description: Desktop virtual companion (pet) for health reminders and grief support. Uses PyQt6 + QWebEngineView + CSS sprite animations with QWebChannel IPC.
---

# DeskDog

A desktop companion application featuring a virtual pet (dog or cat) that walks across the user's screen, displays empathic health reminders, and supports grief processing through interactive speech bubbles.

## When to use

Activate this skill when:
- Writing or modifying any code in the DeskDog project (Python backend or TypeScript/Vite frontend)
- Adding new pet states, animations, or sprite sheets
- Modifying the QWebChannel IPC bridge or patrol physics
- Building or packaging the application with PyInstaller
- Reviewing architecture decisions against the spec constitution

## Instructions

1. **Read the constitution first** — Load `spec/constitution/tech-stack.md` to understand the Python+Web-View architecture constraints:
   - PyQt6/QWebEngineView for the OS window layer
   - QWebChannel for IPC (no HTTP servers or WebSockets)
   - CSS `@keyframes` + `steps()` for sprite animation (no JS frame loops)

2. **Read the feature specs** — Load all files in `spec/features/` before implementing any feature:
   - `python-window.md` — Translucent window, patrol physics, TransparentForInput
   - `pet-render.md` — Sprite states, CSS animation, invisible background
   - `health-prompter.md` — Speech bubble, IPC calls, empathic tone, zero focus-stealing

3. **Follow the guardrails** — Every feature spec contains `🛑` constraint blocks. These are non-negotiable:
   - Never use `setInterval`/`requestAnimationFrame` for sprite frame advancement
   - Never steal keyboard focus with speech bubbles
   - Always subtract viewport dimensions from patrol edge bounds
   - Always apply `background: transparent !important` on the web layer

4. **Refer to DESIGN.md** for the full QWebChannel IPC protocol and CSS animation workflow documentation.

5. **Use `main.py` as the entry point** — The backend initialises the PyQt6 window, the QWebEngineView, the patrol controller, and the QWebChannel bridge. The frontend lives in `frontend/` and is built with Vite + TypeScript.
