# progress.md

## Roadmap
- [x] Basic Project Structure & Reorganization
- [x] Docker Compose setup with PostgreSQL, Google OAuth, Consul
- [x] API Gateway & IAM Service initialization
- [x] Database Connection Best Practices Implementation
- [x] Service-to-Service Communication and DB standardizing.
- [x] Internal inter-service communication migration to gRPC (Billing Service).
- [x] Frontend migration from Keycloak to Google OAuth.
- [x] User Profile (with avatars) & Vehicle Management system.
- [x] Cleanup: Removed Air and simplified dev environment.

## Status
The project has successfully migrated to a Go-based architecture and transitioned from Keycloak to Google OAuth 2.0 for a more modern, frictionless authentication experience. We have implemented a robust User Profile system that now includes profile image support and simplified login requirements (optional phone numbers). The development environment has been streamlined by removing Air in favor of standard Go workflows. gRPC remains the preferred pattern for internal service communication.
