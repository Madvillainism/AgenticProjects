# MokuApp — Technical Tutorial

## Project Structure

```
src/
  assets/
    audio/                  Great.wav (nav tab clicks only)
    images/
      characters/           41 Tekken 8 character portraits (tekkendocs.com)
      mokujin.png           Mokujin transparent sprite (favicon source)
    data/
      pro-players.json          Static catalog: 41 characters, 80+ pro players
      punishable-moves.json     2,395 moves at -10 or worse on block (tekkendocs.com)
  app/
    features/
      pomodoro/pomodoro-timer/     Pomodoro timer with RxJS interval
      todos/todo-list/             CRUD list backed by Dexie.js
      moves/move-list/             Punishment training hub (41-char grid + frame data)
      moves/move-item/             Renders single notation token
      throwbreak/throwbreak/       Throw break reflex mini-game
      pros/pro-directory/          Character grid + YouTube deep links + notebook
    shared/
      models/          TypeScript interfaces for all data types
      services/
        pomodoro.service.ts         RxJS timer, phase machine, localStorage hydration
        db.service.ts               Dexie database (3 tables)
        punishable-moves.service.ts Loads & queries punishable-moves.json
        throwbreak.service.ts       Game state machine with RxJS interval
      utils/
        notation-parser.ts          RegEx tokenizer for Tekken notation strings
public/
  favicon.ico               Mokujin favicon (32x32, converted from the PNG)
```

## Angular 19 Patterns Used

Every component uses `standalone: true` with `ChangeDetectionStrategy.OnPush`. State is managed via `signal()` and `computed()` — no NgModules, no `@Input()`/`@Output()` decorators.

```typescript
private pom = inject(PomodoroService);
phase = signal<PomodoroPhase>('IDLE');
formattedTime = computed(() => `${m}:${s}`);
```

Templates use `@if`, `@for`, `@switch` control flow instead of structural directives.

Character portraits use `NgOptimizedImage` (`[ngSrc]`, explicit `width`/`height`) for lazy loading and responsiveness.

## Theme: Sunlit Dojo

Inspired by Mokujin (a wooden training dummy) but with a bright, warm palette:

- **Warm cream background** (`#F5EDE3`) with subtle wood grain CSS gradients
- **Inter font** — Google Fonts `'Inter'` for all display text and body copy
- **Sunlit palette**: `--bg-dark #F5EDE3`, `--bg-panel #FDF8F2`, `--combat-red #D13434`, `--rest-green #2E7D5E`, `--accent-gold #C8943E`
- **Panel backgrounds**: warm off-white cards (`#EDE3D5` borders) over the body texture
- **Nav bar**: warm light gradient with a red underline accent glow
- **Tree icon**: SVG tree icon (Tabler icons) next to the "MOKUAPP" title in the nav bar, replacing the old Mokujin sprite

## Audio (.wav) Usage

Audio plays **only on navigation** (tab clicks in the nav bar). All feature-level sounds have been removed to keep the training experience focused.

| Sound | Played when | Volume |
|---|---|---|
| `Great.wav` | Switching between pages (nav tab click) | 0.15 |

## Feature Breakdown

### 1. Pomodoro Drills (`/`)

`PomodoroService` runs `interval(1000)`. Three phases:

- **IDLE** → START button.
- **COMBAT** → 10 min countdown. Red border glow.
- **REST** → 5 min countdown. Green border glow.

State persists to localStorage and survives page refresh.

### 2. Training To-Dos (`/todos`)

Dexie.js `trainingTodos` table: `++id, title, completed, createdAt`. Optimistic CRUD — UI updates before the DB write.

### 3. Punishment Training Hub (`/moves`)

Full punishment training interface covering all 41 Tekken 8 characters:

- **Character grid** — 41 portraits with NgOptimizedImage; hides on character select to maximize space
- **Punishment table** — all punishable moves grouped into 2 categories:
  - 🔴 **LAUNCH PUNISHABLE** (-15 or worse on block, ~807 moves) — red accent
  - 🧡 **PUNISHABLE** (-10 to -14 on block, ~1,584 moves) — gold accent
- Each move row: name + notation string + startup frames + on-block frames, at larger font sizes
- **Search bar** — filter by move name OR notation string across all categories
- **Category filter chips** — ALL / LAUNCH / PUNISH toggle buttons
- **Stat bar** — total punishable + per-category counts
- **Notation preview** — click any move to render its notation via `MoveItemComponent`
- **Back button** — returns to the character selection grid

Data source: `punishable-moves.json` — 2,395 moves scraped from tekkendocs.com.

### 4. Throw Break Training (`/throwbreak`)

A reflex mini-game inspired by [throwbreak420](https://github.com/dcep93/throwbreak420).

**Game loop:**
1. Random throw type selected: `1` (LEFT), `2` (RIGHT), `1+2` (BOTH)
2. Text prompt + CSS progress bar crosses a 20-frame break window
3. Press the correct key before the window expires

**Keyboard:**
| Key | Throw break |
|---|---|
| `J` | 1 break (left arm) |
| `K` | 2 break (right arm) |
| `L` | 1+2 break (both arms) |

**Feedback:**
- ✅ Correct (green flash) → 250ms delay → next round
- ⚠️ Slow / wrong button (yellow flash) → 2s delay
- ❌ Wrong (red flash) → 2s delay

**Settings panel:**
- Toggle which throw types appear (1, 2, 1+2)
- Speed slider (0.25x–4x, affects the interval rate)
- Standing vs grounded mode

**Stats:**
- Streak counter + highest streak (localStorage)
- Session totals: correct / slow / wrong
- History log (scrollable)

**Navigation guard:** `ngOnDestroy` stops the game loop when leaving the page, preventing stale timers.

**Persistence:** Dexie `throwBreakSessions` table saves session stats.

### 5. Pro Directory (`/pros`)

- **Character grid** — all 41 Tekken 8 characters with real brand images from tekkendocs.com (NgOptimizedImage)
- First character auto-selected on load
- **Pro player cards** — name, region, "SEARCH YT" opens YouTube with `encodeURIComponent` + `" Tekken 8 Matches"` suffix
- **Notebook** — bookmark URLs filtered by selected character, stored in Dexie `proNotebook` table

Pro players corrected: Atif Butt → Anna, Jeondding → Eddy, Kkokkoma → Feng.

## Character Data

| File | Content |
|---|---|
| `pro-players.json` | 41 characters, 80+ pro players across Korea, Japan, USA, Pakistan, UK, France, Indonesia |
| `punishable-moves.json` | 2,395 moves at -10 or worse on block, scraped from tekkendocs.com. Each entry: name, notation, startup frames, on-block frames, on-hit frames, category (launch/ws/standing/throw) |

## Dexie.js Schema

```
trainingTodos:        ++id, title, completed, createdAt
proNotebook:          ++id, characterName, title, createdAt
throwBreakSessions:   ++id, date, highestStreak
```

## Web Font

Loaded from Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
--font-display: 'Inter', 'Segoe UI', system-ui, sans-serif;
--font-body: 'Inter', 'Segoe UI', system-ui, sans-serif;
```

## Color Palette (Sunlit Dojo)

```
--bg-dark:       #F5EDE3  (cream tatami)
--bg-panel:      #FDF8F2  (warm off-white)
--bg-card:       #EDE3D5  (light oak)
--combat-red:    #D13434  (warm red)
--combat-amber:  #E8673A  (amber accent)
--rest-green:    #2E7D5E  (forest green)
--accent-gold:   #C8943E  (gold)
--text-primary:  #1A1410  (near-black)
--text-secondary:#6B5E50  (warm brown)
--border-color:  #D6CAB8  (light wood)
```

## Commands

```bash
ng serve        # dev server at localhost:4200
ng build        # production build → dist/moku-app
```

## Key Design Decisions

- **No external APIs** — YouTube search is a direct URL redirect, not an API call
- **No Firebase/Supabase** — Dexie.js + localStorage only
- **Audio only on nav** — all feature sounds removed for focused training
- **Character images from tekkendocs.com** — Tekken 8 brand portraits, 256x256 .webp, loaded via NgOptimizedImage
- **Button notation = numbers** — `1`, `2`, `3`, `4` styled as tokens, not colored circles
- **Pure RxJS timer** — `interval(1000)`, no Web Workers
- **CSS-only wood texture** — no external images, just gradients
- **Mokujin favicon** — 32x32 .ico converted from a transparent PNG sprite
- **2,395 punishable moves** — scraped from tekkendocs.com via JSON-injection extraction, reclassified into LAUNCH (-15+) and PUNISHABLE (-10 to -14)
- **Throw break via J/K/L** — keyboard mapping matches arcade button layout (1/2/1+2)
- **ngOnDestroy on ThrowBreak** — stops game loop on page change to prevent memory leaks
