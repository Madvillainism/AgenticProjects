# Implementation Plan - Throw Break Training

## Core Game Loop

1. Random throw type selected from enabled set (1, 2, 1+2)
2. Progress bar animation starts (20-frame window at configurable speed)
3. Player presses 1, 2, or 1+2 before window expires
4. Result evaluated: correct (within window & right button), slow (right button after window), wrong (wrong button)
5. Background color flash feedback
6. Streak updated, audio played
7. Delay (short for correct, long for incorrect) then next round

## State Machine (ThrowBreakService via RxJS)

- `interval()` ticks advance the "frame" counter
- Configurable speed multiplier affects tick rate
- Break window: 20 frames
- States: IDLE → THROWING (progress bar active) → RESULT (feedback display)

## Settings

- Throw type toggles: 1, 2, 1+2 (all on by default)
- Speed: 0.25x to 4x (default 1x)
- Mode: standing / grounded

## Persistence

- Dexie `throwBreakSessions` table: ++id, date, totalThrows, correct, slow, wrong, highestStreak
- Highest streak in localStorage (cross-session brag)

## Files

- `src/app/shared/models/throw-break.model.ts`
- `src/app/shared/services/throwbreak.service.ts`
- `src/app/features/throwbreak/throwbreak.component.ts/html/scss`
