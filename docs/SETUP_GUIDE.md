# Local Development Setup Guide

This guide describes how to run the Makabasla v2 backend microservices locally.

## Prerequisites
- Docker and Docker Compose
- Go 1.26 (for local development outside of Docker)
- Google Cloud Project with OAuth 2.0 Credentials (for authentication)
- Git

## 1. Running complete stack via Docker Compose

The easiest way to run the entire backend is via Docker Compose. This spins up the PostgreSQL database, Consul server, API Gateway, and all backend microservices.

```bash
docker compose --file compose.yaml up --build -d
```

### Services Available
Once running, the following services are available:
- **API Gateway**: `http://localhost:8080`
- **Consul UI**: `http://localhost:8500`
- **PostgreSQL**: `localhost:5432`

The microservices will automatically register themselves with Consul. The API Gateway routes incoming requests to the respective upstream service automatically based on path prefixes or configurations.

### 🔐 Authentication Setup
The system uses **Google OAuth 2.0** via NextAuth.js.
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth Consent Screen.
3. Create OAuth 2.0 Client IDs (Web application).
4. Add `http://localhost:3000/api/auth/callback/google` to Authorized Redirect URIs.
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into your `.env` and `frontend/.env.local` files.

### Monitoring Health
You can monitor the status of all registered services via the [Consul UI](http://localhost:8500). If a service is marked as "critical," it may be due to a failing health check. Detailed documentation on health check endpoints can be found in [Consul Health Checks](CONSUL_HEALTH_CHECKS.md).

## 2. Local Development

### Development Workflow
**Note:** Hot-reloading (Air) has been removed to simplify the development environment. We now use standard Go workflows.

1. **Start infrastructure via Docker**:
```bash
# Start Postgres and Consul
docker compose up -d postgres consul
```

2. **Run a specific service locally**:
```bash
cd backend-services/api-gateway
# First time only
go mod tidy 
# Run the service
go run cmd/main.go
```
(Repeat for `iam-service`, `appointment-service`, `billing-service`, `task-mgt-service`, `webstore-service`)

> **Note:** The Go microservices expect Consul to be available at the host defined via the `CONSUL_HOST` environment variable, and the database at `DB_URL`. If running locally, export `CONSUL_HOST=localhost` and define the relevant `DB_URL`.

## 3. Database Initializer

The `postgres` service is pre-configured to automatically run `backend-services/setup-databases.sql` on the very first startup to provision the databases:
- `billingdb`
- `appointmentdb`
- `taskdb`
- `webstoredb`

If you need to completely reset the databases, remove the docker volume and restart:
```bash
docker-compose down -v
docker-compose up -d postgres
```

### Database environment variables
Each Go microservice uses the following environment variables:
- `DB_URL`: full Postgres DSN (e.g. `postgres://postgres:postgres@localhost:5432/appointmentdb?sslmode=disable`)
- `DB_USER`: Postgres username (defaults to `postgres` in `compose.yaml`)
- `DB_PASSWORD`: Postgres password (defaults to `postgres` in `compose.yaml`)

When running via Docker Compose, you can override per-service DSNs using:
- `BILLING_DB_URL`, `APPOINTMENT_DB_URL`, `TSKMGT_DB_URL`, `WEBSTORE_DB_URL`
