# activeContext.md

## Current Focus
Standardizing database connection patterns across all Go microservices.

## Current Tasks
- [ ] Refactor `appointment-service` to use robust database initialization.
- [ ] Implement connection pooling and retry logic in Go.
- [ ] Update `config/config.go` to use unified `DB_URL`.
- [ ] Sync other services (`billing`, `task-mgt`, `webstore`) with the new pattern.

## Recent Decisions
- Switched backend core from Spring Boot to Go Echo for performance and simplicity in local development.
- Standardized health check paths to `/actuator/health` for consistency with established monitoring filters.
