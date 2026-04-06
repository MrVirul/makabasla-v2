# Implementation Summary

Makabasla v2's backend was recently rearchitected to prioritize lightweight execution and scalability by moving from a Java Spring Boot monolith/polylith to a pure Go-based ecosystem.

## Migration Outcomes

### Java to Go Migration
The entire project shifted to Go 1.24+ (configured as `go 1.26` for future-proofing), allowing us to drop heavy JVM dependencies.
- Replaced **Spring Boot** with fast networking frameworks (Echo/Fiber router).
- Replaced **Netflix Eureka** with **HashiCorp Consul** for robust service discovery.
- Exchanged implicit **Spring Data JPA** automagic with explicit **GORM/Database driver** operations mapping to PostgreSQL.

### Shared Infrastructure (Shared Library)
To prevent code duplication, a `shared` library was introduced:
- **Internal HTTP Client**: Wrapped `Resty` with automatic retries and agnostic token propagation.
- **gRPC Support**: Standardized gRPC server/client wrappers with health checks and reflection. Recently adopted for `billing-service`.
- **Service Discovery**: Unified Consul registration logic used across all services.
- **Logging & Config**: Structured JSON logging (Zap) and centralized environment configuration (Viper).

## Recent Enhancements

### 🔐 Google OAuth 2.0 Migration
Transitioned from an internal Keycloak instance to **Google OAuth 2.0** integrated via **NextAuth.js** on the frontend.
- **Improved UX**: Users can now sign in using their Google accounts without additional account creation steps.
- **Profile Image Support**: The system now automatically fetches and displays user avatars from Google.
- **JIT Provisioning**: The `iam-service` continues to perform Just-In-Time provisioning, syncing Google profile data into local `Customer` and `Admin` records.
- **Simplified DB Models**: Updated models to support optional phone numbers and dedicated `ImageURL` fields.

### ⚡ Development Environment Cleanup
Streamlined the Docker development environment for better performance and predictability:
- **Removed Air**: Transitioned away from Air hot-reloading configurations in favor of standard Go workflows and `go run` commands. This reduced container overhead and fixed filesystem sync issues.
- **Cleaned Orchestration**: Simplified `compose.yaml` by removing Keycloak, Air volumes, and outdated environment variables.

## Current Project Structure

```text
makabasla-v2/
├── backend-services/
│   ├── shared/              # Shared logic (gRPC, HTTP, Discovery, Logging)
│   ├── api-gateway/         # Handles ingress traffic and load balances to Consul instances
│   ├── iam-service/         # Handles User Authorization workflows
│   ├── appointment-service/ # Scheduling domains
│   ├── task-mgt-service/    # Task creation/management
│   ├── webstore-service/    # Product catalogs
│   ├── billing-service/     # FinOps/Invoicing capabilities (gRPC implementation)
│   └── setup-databases.sql  # Initializes logical PostgreSQL schema per service
├── go.work                  # Go workspace for seamless local module sharing
├── compose.yaml             # Complete orchestration file
└── docs/                    # Architectural guidelines
```

## Next Steps
- Implement standard OpenTelemetry / Jaeger tracing across API Gateway and leaf services.
- Define explicit Kubernetes manifests (Helm Charts) to transition away from Compose for production.
