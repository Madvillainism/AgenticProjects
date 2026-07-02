## ADDED Requirements

### Requirement: Click vs drag discrimination
The application SHALL distinguish between a click (mouse press + release within 5 pixels) and a drag (mouse press + move beyond 5 pixels). A click SHALL NOT initiate a drag.

#### Scenario: Click triggers alerting
- **WHEN** the user presses and releases Button-1 on the pet within 5 pixels
- **THEN** the pet SHALL display an alerting animation (switch to alerting state briefly)
- **THEN** the pet SHALL NOT move position

#### Scenario: Drag moves pet
- **WHEN** the user presses Button-1 and moves the cursor more than 5 pixels
- **THEN** the pet SHALL follow the cursor
- **THEN** on release, the pet SHALL stay at the new position and resume idle

### Requirement: Alerting state
The pet SHALL have an "alerting" state using the `*-alerting.png` sprite. The alerting animation SHALL play once (all frames) and return to idle.

#### Scenario: Alert plays once
- **WHEN** the user clicks the pet
- **THEN** the SHALL cycle through all alerting frames once
- **THEN** the pet SHALL return to idle state
