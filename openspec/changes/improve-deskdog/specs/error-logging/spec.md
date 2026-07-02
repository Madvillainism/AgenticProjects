## ADDED Requirements

### Requirement: Rotating log file
The application SHALL write log entries to `%APPDATA%/DeskDog/logs/deskdog.log`. Log files SHALL rotate at 1 MB, keeping up to 3 backups.

#### Scenario: Log written on startup
- **WHEN** the application starts
- **THEN** an INFO-level log entry SHALL be written with version, Python version, and screen info

#### Scenario: Rotation at size limit
- **WHEN** the log file exceeds 1 MB
- **THEN** it SHALL be renamed to `deskdog.log.1` and a new `deskdog.log` SHALL start

### Requirement: Graceful degradation on missing sprites
If a sprite file is missing or corrupt, the application SHALL log a WARNING and continue with the existing frame (freeze animation) rather than crashing.

#### Scenario: Missing sprite file
- **WHEN** a state PNG file is not found
- **THEN** the application SHALL log a WARNING with the missing file path
- **THEN** the pet SHALL display the last successfully loaded frame
