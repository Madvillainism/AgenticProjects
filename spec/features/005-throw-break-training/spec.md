# Spec - Throw Break Training

## Description

A reflex-training mini-game teaching the player to recognize and break throws in real time. Displays a text prompt indicating throw type (LEFT, RIGHT, BOTH) with a CSS progress bar simulating the 20-frame break window. The player must press the correct break input before the window closes.

## Acceptance Criteria

- Displays a randomly chosen throw type: 1 (LEFT), 2 (RIGHT), or 1+2 (BOTH)
- A horizontal progress bar crosses the 20-frame window to visually indicate timing
- Player inputs via keyboard (1, 2, 3 for 1+2) or on-screen buttons
- Correct input within the window: green flash + audio
- Correct input after the window closes (slow): yellow flash + audio
- Wrong input: red flash + audio
- Streak counter and highest streak (localStorage)
- Session settings: toggle throw types, speed multiplier, standing/grounded mode
- History log per session: answer, input, frame, correctness
- Session stats persisted to IndexedDB (total throws, correct, slow, wrong, streak)
