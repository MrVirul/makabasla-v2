# activeContext.md

## Current Focus
Standardizing database connection patterns across all Go microservices.

## Current Tasks
- [x] Refactor `appointment-service` to use robust database initialization.
- [ ] Implement connection pooling and retry logic in Go.
- [x] Update `config/config.go` to use unified `DB_URL`, `DB_USER`, `DB_PASSWORD`.
- [x] Sync other services (`billing`, `task-mgt`, `webstore`) with the new pattern.

## Recent Decisions
- Switched backend core from Spring Boot to Go Echo for performance and simplicity in local development.
- Standardized health check paths to `/actuator/health` for consistency with established monitoring filters.
- Standardized service database initialization via `internal/database.NewDatabase(cfg)` and repository DI using `*gorm.DB`.
