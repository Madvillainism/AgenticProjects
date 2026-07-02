## ADDED Requirements

### Requirement: Cancelable patrol timers
All patrol-related `after()` timer handles SHALL be stored by logical name so they can be cancelled in bulk. Dragging the pet SHALL cancel any in-progress patrol movement and reset patrol state.

#### Scenario: Drag cancels patrol
- **WHEN** the user starts dragging the pet during a patrol move
- **THEN** the patrol movement SHALL be cancelled immediately
- **THEN** the pet SHALL NOT snap to the pre-drag target position on release

### Requirement: Vertical idle bob
During idle state, the pet SHALL execute a gentle vertical bobbing animation (sinusoidal, ±3 pixels over 2 seconds). This SHALL NOT interfere with click-through or dragging.

#### Scenario: Bob visible during idle
- **WHEN** the pet is in idle state
- **THEN** its Y position SHALL oscillate ±3 pixels with a period of ~2 seconds

#### Scenario: Bob stops during patrol
- **WHEN** the pet transitions to walking state
- **THEN** the vertical bob SHALL pause at the current Y position

### Requirement: Smooth state transitions
Transitions between idle, walking, and sleeping states SHALL be smooth. The walking animation SHALL use smoothstep easing (current code uses `t²(3-2t)`, retain this).

#### Scenario: Transition from idle to walking
- **WHEN** patrol begins
- **THEN** the pet SHALL smoothly accelerate from a stop using smoothstep easing
