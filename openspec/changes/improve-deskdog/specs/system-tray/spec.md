## ADDED Requirements

### Requirement: System tray icon with show/hide
The application SHALL display an icon in the Windows system tray while running. The icon SHALL remain visible even when the pet window is hidden. Clicking the icon SHALL show the pet window if hidden, or hide it if visible.

#### Scenario: Icon appears on startup
- **WHEN** the application starts
- **THEN** an icon SHALL appear in the system tray

#### Scenario: Hide to tray
- **WHEN** the user closes the pet window
- **THEN** the pet SHALL hide and the tray icon SHALL remain active

#### Scenario: Show from tray
- **WHEN** the user clicks the tray icon
- **THEN** the pet window SHALL be shown and brought to front

### Requirement: Tray context menu
The tray icon SHALL have a context menu with "Show/Ocultar" and "Salir" options.

#### Scenario: Quit from tray menu
- **WHEN** the user selects "Salir" from the tray context menu
- **THEN** the application SHALL exit completely (window + tray + process)
