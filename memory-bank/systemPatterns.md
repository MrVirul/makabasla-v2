# systemPatterns.md

## Architecture Style
- **Microservices**: Distributed services communicating over HTTP via a central Gateway.
- **Service Discovery**: HashiCorp Consul for service registration and health checks.

## Key Patterns
- **Database Per Service**: Each microservice owns its PostgreSQL database (e.g., `appointmentdb`, `taskdb`).
- **API Gateway**: Entry point for all external traffic, handling routing and cross-cutting concerns.
- **Dependency Injection**: Go services use explicit DI for repositories and internal logic for testability.
- **Standardized Configuration**: Using Viper for environment-aware configuration management.
- **DB initialization**: Each service initializes a shared `*gorm.DB` via `internal/database.NewDatabase(cfg)` and passes it to repositories.

## Authentication
- **External Auth**: Keycloak providing OIDC/JWT.
- **Service Level**: Gateway and IAM service validate JWT tokens before forwarding requests.
