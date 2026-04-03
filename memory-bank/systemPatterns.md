# systemPatterns.md

## Architecture Style
- **Microservices**: Distributed services communicating over HTTP via a central Gateway, and inter-service communication over gRPC.
- **Service Discovery**: HashiCorp Consul for service registration and health checks.

## Key Patterns
- **gRPC for Internal Comm**: Using gRPC and Protocol Buffers for fast, typed communication between internal backend microservices.
- **Database Per Service**: Each microservice owns its PostgreSQL database (e.g., `appointmentdb`, `taskdb`).
- **API Gateway**: Entry point for all external traffic, handling routing and cross-cutting concerns.
- **Dependency Injection**: Go services use explicit DI for repositories and internal logic for testability.
- **Standardized Configuration**: Using Viper for environment-aware configuration management.
- **DB initialization**: Each service initializes a shared `*gorm.DB` via `internal/database.NewDatabase(cfg)` and passes it to repositories.

## Authentication
### User Management
- **User Shadow Table**: Each service requiring customer domain logic (like `iam-service`) maintains a local "shadow" copy of user profile data (email, name, phone).
- **Just-in-Time (JIT) Provisioning**: Local customer records are created or updated automatically when a user visits the profile or makes a request, ensuring the service has all necessary domain data.
- **Frontend Sync**: NextAuth extracts unique Keycloak IDs (`sub`) and maps them to service logic for consistent user tracking across microservices.
