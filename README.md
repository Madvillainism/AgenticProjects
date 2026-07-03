# MokuApp — Tekken Training Dojo

A multi-agent Tekken 8 training companion built with Angular 19, Dexie.js, and a Sunlit Dojo aesthetic. Features a pomodoro drill timer, training todo list, punishment training hub (all 41 characters), pro player directory, and a throw break reflex mini-game.

## Features

| Route | Feature | What it does |
|---|---|---|
| `/` | Pomodoro Drills | 10 min COMBAT / 5 min REST timer |
| `/todos` | Training To-Dos | Dexie.js-backed CRUD task list |
| `/moves` | Punishment Training | 2,395 punishable moves across all 41 chars, grouped by LAUNCH / PUNISHABLE |
| `/throwbreak` | Throw Break Training | Reflex mini-game: press J/K/L to break throws against a 20-frame window |
| `/pros` | Pro Directory | 41 characters, 80+ pro players, YouTube deep links, notebook |

## Tech Stack

- **Angular 19** — standalone components, Signals, OnPush, RxJS
- **Dexie.js** — IndexedDB for todos, notebook, throw break sessions
- **Inter font** — Google Fonts, clean modern display
- **Sunlit Dojo palette** — cream tatami bg, light oak panels, warm red/gold/green accents

## Quick Start

```bash
ng serve        # dev → localhost:4200
ng build        # production → dist/moku-app
```

## Architecture

```
src/
  assets/
    audio/              .wav files (Great.wav for nav only)
    images/characters/  41 Tekken 8 portraits (tekkendocs.com)
    data/
      pro-players.json       80+ pro players across all 41 characters
      punishable-moves.json  2,395 frame-data moves (-10 or worse on block)
  app/
    features/
      pomodoro/       PomodoroService + timer component
      todos/          TodoListComponent + Dexie CRUD
      moves/          Punishment training hub + notation parser + search/filter
      pros/           Character grid + YouTube links + notebook
      throwbreak/     Throw break mini-game + settings + ngOnDestroy
    shared/
      models/         All TypeScript interfaces
      services/       Dexie DB, Pomodoro, PunishableMoves, ThrowBreak
      utils/          Notation parser, notation pipe
```

## Keyboard Shortcuts (Throw Break)

| Key | Action |
|-----|--------|
| `J` | 1 break (left arm) |
| `K` | 2 break (right arm) |
| `L` | 1+2 break (both arms) |

## Build

```bash
ng build --configuration production
# Output: dist/moku-app/ (273 kB initial, ~35 kB lazy chunks)
```
