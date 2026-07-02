## ADDED Requirements

### Requirement: Config in APPDATA
The application SHALL store `config.json` in `%APPDATA%/DeskDog/config.json`. On first run after update, the application SHALL attempt to read the old location (next to exe) and migrate its contents to the new location.

#### Scenario: New install creates config
- **WHEN** the application runs for the first time with no existing config
- **THEN** a new config.json SHALL be created at `%APPDATA%/DeskDog/config.json`

#### Scenario: Migration from old location
- **WHEN** the application starts and old `config.json` exists next to the exe
- **THEN** the application SHALL read it and write contents to `%APPDATA%/DeskDog/config.json`
- **THEN** the old file SHALL remain (no deletion) to avoid data loss

#### Scenario: Prefer new location
- **WHEN** both old and new config files exist
- **THEN** the new location SHALL be authoritative; old location SHALL be ignored (not overwritten)
