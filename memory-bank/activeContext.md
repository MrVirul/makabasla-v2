# activeContext.md

## Current Focus
Simplifying the development environment by removing Air and finalizing the Google OAuth integration.

## Current Tasks
- [x] Migrate from Keycloak to Google OAuth 2.0 with NextAuth.js.
- [x] Remove Air configurations and simplify Docker development setup.
- [x] Enhance `iam-service` models with User Avatar support and optional Phone field.
- [ ] Implement connection pooling and retry logic in Go.

## Recent Decisions
- **Google OAuth Migration**: Replaced Keycloak with Google OAuth 2.0 for a more streamlined developer experience and easier user onboarding. Frontend now handles identity, while `iam-service` manages local profiles and authorization.
- **Removed Air**: Decided to remove Air hot-reloading configurations in favor of standard `go run` to simplify the development environment and reduce container complexity.
- **gRPC Migration**: Adopted gRPC for performant, strongly-typed internal service-to-service communication. Implemented this in the `billing-service` and provided shared gRPC client/server wrappers.
- **User Profile Sync**: Enhanced "Just-in-Time Provisioning" in `iam-service` to include user profile images (avatars) from Google and made phone numbers optional to support diverse login methods.
- Switched backend core from Spring Boot to Go Echo for performance and simplicity in local development.
- Standardized health check paths to `/actuator/health` for consistency with established monitoring filters.
- Standardized service database initialization via `internal/database.NewDatabase(cfg)` and repository DI using `*gorm.DB`.
- **Frontend Core**: Standardized on Next.js 15+ with Shadcn UI for a consistent, premium design system.
