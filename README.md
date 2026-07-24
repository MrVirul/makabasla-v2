<div align="center">

# Makabasla GMS

**Garage management system built with Go microservices and a Next.js frontend.**

[![CI](https://github.com/MrVirul/makabasla-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/MrVirul/makabasla-v2/actions/workflows/ci.yml)
[![Go](https://img.shields.io/badge/Go-1.26.1-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Consul](https://img.shields.io/badge/Consul-1.15-8f46d8?logo=consul&logoColor=white)](https://www.consul.io/)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Services & Ports](#services--ports)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## About

Makabasla GMS is a garage management platform composed of independently deployable Go
microservices behind an API gateway, with a Next.js App Router frontend. Services register
themselves with HashiCorp Consul for discovery, the gateway validates JWTs before proxying
requests, and each service owns its own PostgreSQL database.

## Features

- **Microservices architecture** — six independently deployable services with a shared Go workspace (`go.work`)
- **Service discovery** — automatic registration and health checks via HashiCorp Consul
- **API gateway** — centralized routing, JWT validation, and CORS handling
- **Identity & access management** — Google OAuth 2.0 sign-in with just-in-time user profile sync
- **Vehicle management** — customer vehicle registration and profile editing
- **Billing** — per-vehicle bills with advance payments and expense tracking
- **Service management** — task tracking, appointments, and webstore inventory
- **Modern dashboard** — glassmorphic UI built with Tailwind CSS 4 and Radix primitives
- **CI enforced** — GitHub Actions runs semantic PR title linting plus Go and Next.js builds

## Tech Stack

### Backend

| Technology | Role |
| --- | --- |
| Go 1.26.1 | Service runtime (workspace-managed via `go.work`) |
| Echo | HTTP server and router |
| gRPC + Protobuf | Inter-service communication |
| PostgreSQL 16 | Primary datastore (one database per service) |
| HashiCorp Consul 1.15 | Service discovery and health checking |
| Resty | Internal HTTP client with retries |
| JWT | Token validation at the gateway |

### Frontend

| Technology | Role |
| --- | --- |
| Next.js 16 | React framework (App Router) |
| React 19 | UI runtime |
| TypeScript 6 | Type safety |
| Tailwind CSS 4 | Styling |
| Radix UI | Accessible component primitives |
| NextAuth.js | Session and OAuth handling |
| Recharts | Dashboard charts |
| Lucide React | Iconography |

## Architecture

```text
                        ┌──────────────────┐
   Browser  ──────────▶  │   Next.js App    │  :3000
                        └────────┬─────────┘
                                 │ REST + Bearer JWT
                                 ▼
                        ┌──────────────────┐
                        │   API Gateway    │  :8080
                        │  auth · CORS ·   │
                        │    routing       │
                        └────────┬─────────┘
                                 │ service lookup via Consul :8500
        ┌────────────┬───────────┼───────────┬────────────┬────────────┐
        ▼            ▼           ▼           ▼            ▼            ▼
   iam-service  billing-svc  task-mgt-svc  appt-svc   webstore-svc   proto
     :8084        :8083        :8086        :8085       :8087        (gRPC)
        │            │           │           │            │
        ▼            ▼           ▼           ▼            ▼
   ┌─────────┐  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │Postgres │  │Postgres │ │Postgres │ │Postgres │ │Postgres │
   └─────────┘  └─────────┘ └─────────┘ └─────────┘ └─────────┘
                     database per service  :5432
```

## Services & Ports

| Service | Port | Responsibility |
| --- | --- | --- |
| `api-gateway` | 8080 | Routing, JWT validation, CORS |
| `iam-service` | 8084 | Users, profiles, vehicles |
| `billing-service` | 8083 | Bills, advances, expenses |
| `appointment-service` | 8085 | Booking and scheduling |
| `task-mgt-service` | 8086 | Work task tracking |
| `webstore-service` | 8087 | Parts and inventory |
| `postgres` | 5432 | Relational datastore |
| `consul` | 8500 | Service registry and UI |
| `frontend` | 3000 | Next.js dev server |

## Project Structure

```text
makabasla-v2/
├── compose.yaml                     # Orchestrates all services + infrastructure
├── go.work                          # Go workspace spanning backend modules
├── Makefile                         # Root task runner (make test)
├── CONTRIBUTING.md                  # Commit and PR conventions
├── backend-services/
│   ├── Dockerfile.dev               # Shared dev image for backend workflows
│   ├── api-gateway/                 # Edge routing and auth
│   ├── iam-service/                 # Identity, access, vehicles
│   ├── billing-service/             # Invoicing and payments
│   ├── appointment-service/         # Scheduling
│   ├── task-mgt-service/            # Task tracking
│   ├── webstore-service/            # Parts inventory
│   └── shared/                      # Config, discovery, gRPC, HTTP client, logger
│       ├── proto/                   # Protobuf contracts (common, billing)
│       └── pkg/                     # Shared Go packages
├── frontend/                        # Next.js App Router application
├── billing-api/
│   └── opencollection.yml           # Billing API specification
├── tests/                           # Centralized service test runner
└── docs/                            # Architecture, setup, and reference guides
```

## Prerequisites

- **Go 1.26.1** — backend services
- **Node.js 20+** — frontend (Next.js 16 requires Node 18.18+)
- **Docker & Docker Compose** — infrastructure and service orchestration
- **Google Cloud OAuth credentials** — required for Google sign-in

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/MrVirul/makabasla-v2.git
cd makabasla-v2
```

### 2. Configure environment

`.env` is git-ignored and must be created manually in the project root. Copy the variable
names from [Configuration](#configuration) and fill in real values — Compose and every
service read from this single file.

### 3. Start the backend

```bash
docker compose up --build -d
```

This starts PostgreSQL, Consul, the API gateway, and all five microservices. Follow the
logs to confirm each service registers with Consul:

```bash
docker compose logs -f
```

Consul UI at http://localhost:8500 should list every healthy service.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Verify

| Endpoint | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API gateway | http://localhost:8080 |
| Consul UI | http://localhost:8500 |
| Profile | http://localhost:3000/profile |

## Configuration

All services read from environment variables defined in a root `.env` file.

### Infrastructure

| Variable | Purpose |
| --- | --- |
| `POSTGRES_USER` | Postgres superuser used by every service |
| `POSTGRES_PASSWORD` | Postgres password |
| `CONSUL_HOST` | Consul address used for service discovery |

### Databases

Each service owns a separate database and reads its own connection string.

| Variable | Service |
| --- | --- |
| `IAM_DB_URL` | `iam-service` |
| `BILLING_DB_URL` | `billing-service` |
| `APPOINTMENT_DB_URL` | `appointment-service` |
| `TSKMGT_DB_URL` | `task-mgt-service` |
| `WEBSTORE_DB_URL` | `webstore-service` |

### Authentication

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Registered OAuth callback URL |
| `NEXTAUTH_SECRET` | NextAuth session signing secret |
| `NEXTAUTH_URL` | Public frontend base URL |

Generate a secret with:

```bash
openssl rand -base64 32
```

## Testing

Run the system service unit tests from the repository root:

```bash
make test
```

Run tests for a single module:

```bash
go test ./backend-services/iam-service/...
```

Build the frontend:

```bash
cd frontend && npm run build
```

Regenerate Go code from the Protobuf contracts:

```bash
cd backend-services/shared && make protos
```

Both backends and frontend builds run automatically in CI on every push and pull request
against `main` and `dev`.

## Documentation

Extended documentation lives in [`docs/`](docs/) — start with the
[backend documentation index](docs/README.md).

| Document | Description |
| --- | --- |
| [Setup Guide](docs/SETUP_GUIDE.md) | Full backend setup walkthrough |
| [Quick Reference](docs/QUICK_REFERENCE.md) | Command and port reference |
| [Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md) | Service topology and request flows |
| [Backend Functionalities](docs/BACKEND_FUNCTIONALITIES.md) | Endpoint-level feature catalogue |
| [Consul Health Checks](docs/CONSUL_HEALTH_CHECKS.md) | Health check configuration |
| [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) | Current implementation state |
| [Checklist](docs/CHECKLIST.md) | Testing and deployment checklist |

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming,
commit message conventions, and the pull request workflow. PR titles are linted for semantic
formatting in CI.

## License

No `LICENSE` file has been added to this repository yet. Until one is committed, all rights
are reserved — add a license before distributing or publishing the project.
