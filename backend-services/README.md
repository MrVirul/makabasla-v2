# Backend Microservices

A Go microservices architecture for the Makabasla appointment booking system, with **Consul** service discovery, an **API Gateway**, and multiple business services.

## 🏗️ Architecture

```
React Frontend → API Gateway → (Consul) → Microservices → PostgreSQL
                        │
                        └────────────→ Keycloak (IAM)
```

**Technology Stack:**

- Go (see each service’s `go.mod`, currently `go 1.26`)
- Echo (HTTP server/router)
- Consul (service discovery + health checks)
- Keycloak (identity provider)
- PostgreSQL
- Docker / Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker + Docker Compose

### Setup & Run

```bash
# From repo root
docker compose -f compose.yaml up --build
```

### Access Points

| Component / Service | URL | Purpose |
| --- | --- | --- |
| Consul UI | http://localhost:8500 | Service discovery UI + health status |
| Keycloak | http://localhost:8180 | Identity provider |
| API Gateway | http://localhost:8080 | Gateway (routes/auth) |
| Billing Service | http://localhost:8083 | Billing APIs |
| IAM Service | http://localhost:8084 | IAM integration APIs |
| Appointment Service | http://localhost:8085 | Appointment APIs |
| Task Mgt Service | http://localhost:8086 | Task APIs |
| Webstore Service | http://localhost:8087 | Webstore APIs |

## 📦 Services

### Infrastructure

- **Consul** (via `compose.yaml`) - service discovery and health status
- **Keycloak** (via `compose.yaml`) - identity provider used by the gateway/services
- **[api-gateway/](api-gateway/)** - centralized routing, CORS, auth middleware

### Microservices

- **[billing-service/](billing-service/)** - Billing operations (PostgreSQL)
- **[iam-service/](iam-service/)** - IAM integration endpoints (Keycloak)
- **[appointment-service/](appointment-service/)** - Appointment scheduling (PostgreSQL)
- **[task-mgt-service/](task-mgt-service/)** - Task management (PostgreSQL)
- **[webstore-service/](webstore-service/)** - Web store operations (PostgreSQL)

## 🧪 Testing

```bash
# Health checks
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8083/health  # Billing
curl http://localhost:8084/health  # IAM
curl http://localhost:8085/health  # Appointment
curl http://localhost:8086/health  # Task Mgt
curl http://localhost:8087/health  # Webstore

# Consul API (leader should return a node name)
curl http://localhost:8500/v1/status/leader
```

## 📚 Documentation

Comprehensive documentation is in the [`docs/`](../docs/) directory:

- **[Setup Guide](../docs/SETUP_GUIDE.md)** - Complete implementation guide
- **[Quick Reference](../docs/QUICK_REFERENCE.md)** - Command cheat sheet
- **[Architecture Diagram](../docs/ARCHITECTURE_DIAGRAM.md)** - System architecture
- **[Implementation Summary](../docs/IMPLEMENTATION_SUMMARY.md)** - What was built
- **[Checklist](../docs/CHECKLIST.md)** - Testing and deployment

## ⚡ Key Features

- ✅ **Service Discovery** - Automatic registration with Consul
- ✅ **CORS Support** - Configured for React (ports 3000, 5173)
- ✅ **Auth Integration** - Gateway integrates with Keycloak (see `compose.yaml`)
- ✅ **Health Monitoring** - Lightweight `/health` endpoints used by Consul checks
- ✅ **Database Per Service** - appointmentdb, taskdb, webstoredb
- ✅ **Centralized Routing** - All requests through API Gateway

## 🔧 Configuration

### Port Allocation

| Component / Service | Port | Database |
| --- | --- | --- |
| Consul | 8500 | - |
| Keycloak | 8180 | iamdb (PostgreSQL) |
| API Gateway | 8080 | - |
| Billing Service | 8083 | billingdb |
| IAM Service | 8084 | - |
| Appointment Service | 8085 | appointmentdb |
| Task Mgt Service | 8086 | taskdb |
| Webstore Service | 8087 | webstoredb |

### Database Credentials

When using `compose.yaml`, PostgreSQL defaults to:

- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- Port `5432`

Databases are initialized from `backend-services/setup-databases.sql`.

### Common Environment Variables

Most services accept (via env vars):

- `SERVER_PORT` (defaults match the table above)
- `APP_NAME` (used for Consul registration)
- `CONSUL_HOST` (default: `consul` in Docker network)
- `CONSUL_PORT` (default: `8500`)

Services with PostgreSQL also accept:

- `DB_URL` (e.g. `postgres://postgres:postgres@postgres:5432/appointmentdb?sslmode=disable`)
- `DB_USER`
- `DB_PASSWORD`

## 🐛 Troubleshooting

### Services Won't Start

- Check ports: `lsof -i :5432,8180,8500,8080,8083,8084,8085,8086,8087`
- Rebuild cleanly: `docker compose -f compose.yaml up --build`

### Service Not Registering

- Verify Consul is running: http://localhost:8500
- In Consul UI, check the service health status (critical usually means `/health` is failing or unreachable)
- Ensure the service and Consul are on the same Docker network (`makabasla-network`)

### Database Connection Failed

- Check PostgreSQL is running: `docker ps` (or `pg_isready` if running locally)
- Verify databases exist: `psql -U postgres -l` (or connect to the container)
- Verify each service’s `DB_URL` matches the intended DB

### Gateway Returns 503

- Ensure the target service is registered and healthy in Consul UI
- Restart the gateway after dependent services are healthy

## 🔄 Development Workflow

1. Make changes to your service
2. Rebuild and restart containers:
   - `docker compose -f compose.yaml up --build`
3. Verify health/registration in Consul UI: http://localhost:8500

---

**Version**: 1.1.0  
**Last Updated**: 2026-03-18  
**Status**: ✅ Ready for Development
