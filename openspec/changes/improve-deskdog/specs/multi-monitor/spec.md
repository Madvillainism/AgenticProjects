## ADDED Requirements

### Requirement: Multi-monitor patrol bounds
Pet patrol movement SHALL be bounded within the physical screen area of all connected monitors. The pet SHALL NOT wander into gaps between monitors or off-screen areas.

#### Scenario: Patrol constrained to monitor layout
- **WHEN** the pet patrols on a system with multiple monitors
- **THEN** its X coordinates SHALL stay within the virtual desktop bounds covering all monitors

#### Scenario: Initial placement on active monitor
- **WHEN** the application starts
- **THEN** the pet SHALL appear on the monitor where the cursor is located
