# activeContext.md

## Current Focus
Standardizing database connection patterns across all Go microservices.

## Current Tasks
- [x] Implement User Profile and Vehicle Management feature.
- [x] Integrate shadcn/ui and NextAuth for a robust frontend experience.
- [ ] Implement connection pooling and retry logic in Go.

## Recent Decisions
- Switched backend core from Spring Boot to Go Echo for performance and simplicity in local development.
- Standardized health check paths to `/actuator/health` for consistency with established monitoring filters.
- Standardized service database initialization via `internal/database.NewDatabase(cfg)` and repository DI using `*gorm.DB`.
- **User Profile Sync**: Adopted "Just-in-Time Provisioning" in `iam-service` to sync Keycloak user data into a local domain-specific `Customer` table.
- **Frontend Core**: Standardized on Next.js 15+ with Shadcn UI for a consistent, premium design system.
