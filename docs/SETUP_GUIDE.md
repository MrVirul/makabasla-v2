# Local Development Setup Guide

This guide describes how to run the Makabasla v2 backend microservices locally.

## Prerequisites

- Docker and Docker Compose
- Go 1.26 (for local development outside of Docker)
- Google Cloud Project with OAuth 2.0 Credentials (for authentication)
- Git

## Project Structure (Detailed)

```text
makabasla-v2/
├── compose.yaml                                 # Local orchestration (development)
├── go.work                                      # Go workspace for all backend modules
├── README.md
├── backend-services/
│   ├── Dockerfile.dev                           # Shared dev image for backend workflows
│   ├── README.md
│   ├── api-gateway/
│   │   ├── Dockerfile                           # API Gateway container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── handler/
│   │       └── middleware/
│   ├── appointment-service/
│   │   ├── Dockerfile                           # Appointment service container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── database/
│   │       ├── discovery/
│   │       ├── handler/
│   │       ├── models/
│   │       ├── repository/
│   │       └── service/
│   ├── billing-service/
│   │   ├── Dockerfile                           # Billing service container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── database/
│   │       ├── discovery/
│   │       ├── handler/
│   │       ├── models/
│   │       ├── repository/
│   │       └── service/
│   ├── iam-service/
│   │   ├── Dockerfile                           # IAM service container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── database/
│   │       ├── discovery/
│   │       ├── handler/
│   │       ├── models/
│   │       ├── repository/
│   │       └── service/
│   ├── task-mgt-service/
│   │   ├── Dockerfile                           # Task management service container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── database/
│   │       ├── discovery/
│   │       ├── handler/
│   │       ├── repository/
│   │       └── service/
│   ├── webstore-service/
│   │   ├── Dockerfile                           # Webstore service container image
│   │   ├── go.mod
│   │   ├── cmd/main.go
│   │   ├── config/config.go
│   │   └── internal/
│   │       ├── database/
│   │       ├── discovery/
│   │       ├── handler/
│   │       ├── repository/
│   │       └── service/
│   └── shared/
│       ├── go.mod
│       ├── Makefile
│       ├── pkg/                                 # Shared config, discovery, grpc, httpclient, logger
│       └── proto/                               # Shared protobuf contracts
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/
├── billing-api/
│   └── opencollection.yml
├── docs/
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── CHECKLIST.md
│   ├── CONSUL_HEALTH_CHECKS.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── QUICK_REFERENCE.md
│   ├── REORGANIZATION_SUMMARY.md
│   └── SETUP_GUIDE.md
└── memory-bank/
    ├── activeContext.md
    ├── productContext.md
    ├── progress.md
    ├── projectbrief.md
    ├── systemPatterns.md
    └── techContext.md

Dockerfile locations (quick reference):
- backend-services/Dockerfile.dev
- backend-services/api-gateway/Dockerfile
- backend-services/appointment-service/Dockerfile
- backend-services/billing-service/Dockerfile
- backend-services/iam-service/Dockerfile
- backend-services/task-mgt-service/Dockerfile
- backend-services/webstore-service/Dockerfile
```

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

The `postgres` service is pre-configured to automatically run `scripts/init-databases.sh` on the very first startup to provision the databases:

- `billingdb`
- `appointmentdb`
- `taskdb`
- `webstoredb`
- `iamdb`

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

## 4. Sample Data

`scripts/seed-data.sh` populates every service database with a small, internally consistent data set: a handful of customers, their vehicles, technicians, staff, invoices with matching expense/advance line items, appointments, tasks, and store products with orders.

```bash
# Requires the postgres container to be running
./scripts/seed-data.sh
```

The script is idempotent — re-running it will not duplicate rows, and it re-applies the sample passwords so the credentials below keep working.

> [!NOTE]
> Start the backend services before seeding. Each service creates its own tables with
> GORM `AutoMigrate` on startup, and `appointmentdb` in particular has no tables until
> `appointment-service` has run at least once.

Seeded row counts:

| Database | Tables and rows |
| --- | --- |
| `iamdb` | `admins` 2, `customers` 3, `staffs` 2, `technicians` 3, `vehicles` 4 |
| `billingdb` | `billings` 3, `expenses` 7, `advances` 3 |
| `appointmentdb` | `appointments` 4 |
| `taskdb` | `tasks` 5 |
| `webstoredb` | `products` 6, `orders` 5 |

### How the data links together

Identifiers are not interchangeable across services, so the seeded rows use each
service's native key type:

- `iamdb` uses **string** IDs for customers (`cu-…`), technicians (`te-…`), admins
  (`ad-…`) and staff (`st-…`), but an auto-increment **bigint** for vehicles.
- `appointmentdb.appointments` therefore stores `customer_id` and `technician_id` as
  text and `vehicle_id` as bigint, matching
  `backend-services/appointment-service/internal/models/appointment.go`.
- `billingdb.billings` and `taskdb.tasks` reference vehicles by the numeric
  `iamdb.vehicles.id`, since those columns are plain bigints with no cross-database
  foreign key.

Each appointment's `customer_id` matches the owner of the `vehicle_id` it points at,
and every `customer_id` / `technician_id` resolves to a real IAM row. Billing totals
are internally consistent as well: each invoice's `total_expenses` and
`total_advances` equal the sum of its `expenses` and `advances` rows, and
`balance_due = total_expenses - total_advances`.

## 5. Sample User Credentials

> [!WARNING]
> These credentials are for **local development only**. The IAM service currently stores and compares passwords in **plaintext** — `bcrypt` is imported but commented out in `backend-services/iam-service/internal/service/iam_service.go`. Never use these accounts, or the seeded data, in any deployed environment. Fixing password hashing is tracked as a prerequisite for any production rollout.

Run `./scripts/seed-data.sh` first — the accounts below are created by it.

### Administrators

Login with the **username**. These are stored in the `iamdb.admins` table.

| Username | Password | Email | Name |
| --- | --- | --- | --- |
| `admin` | `admin123` | admin@makabasla.test | Ashan Perera |
| `manager` | `manager123` | manager@makabasla.test | Nadeesha Silva |

### Customers

Login with the **email address**. These are stored in the `iamdb.customers` table.

| Email | Password | Name | Vehicle |
| --- | --- | --- | --- |
| kasun@example.test | customer123 | Kasun Jayawardena | Toyota Corolla Axio (WP-CAB-1234), Honda Vezel (WP-CAD-5678) |
| dilani@example.test | customer123 | Dilani Fernando | Suzuki Wagon R (CP-CAE-9012) |
| ruwan@example.test | customer123 | Ruwan Bandara | Nissan Leaf (WP-CAF-3456) |

### Staff and technicians

Staff and technicians have no login endpoint, so there are no credentials for them. They are seeded as reference data for appointments, tasks, and billing lookups.

| Role | Email | Name | Detail |
| --- | --- | --- | --- |
| Staff | frontdesk@makabasla.test | Ishara Weerasinghe | role `front-desk` |
| Staff | accounts@makabasla.test | Malith Gunawardena | role `accountant` |
| Technician | sunil@makabasla.test | Sunil Rathnayake | Engine & Transmission |
| Technician | priya@makabasla.test | Priya Mendis | Electrical Systems |
| Technician | kamal@makabasla.test | Kamal Dissanayake | Bodywork & Paint |

### Logging in

`POST /api/v1/auth/login` on the IAM service (port 8084).

The request body has a single `username` field. The service routes on its content: if it contains `@` it is treated as a customer email, otherwise as an administrator username.

```bash
# Administrator
curl -X POST http://localhost:8084/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

# Customer
curl -X POST http://localhost:8084/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"kasun@example.test","password":"customer123"}'
```

To reach IAM through the API gateway, the `/api/auth` prefix is stripped before forwarding, so the usable path keeps a second `/api` segment:

```bash
curl -X POST http://localhost:8080/api/auth/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

> [!NOTE]
> The doubled `api` segment is a side effect of the gateway's prefix stripping (see `NewProxy` in `backend-services/api-gateway/cmd/main.go`). The same mismatch affects the `/api/task` and `/api/appointment` proxy routes, which return `404` today. This is a known routing bug, not a credential problem.

A successful login returns `200` with the user record and their roles:

```json
{
  "id": "ad-0000-0000-0000-000000000001",
  "name": "Ashan Perera",
  "email": "admin@makabasla.test",
  "image": "https://i.pravatar.cc/150?img=12",
  "roles": ["admin", "super_admin"]
}
```

Invalid credentials return `401` with `{"message": "invalid credentials"}`.

### Administrator dev bypass

`LoginAdmin` accepts the literal password `admin` for any administrator, even when the stored password does not match:

```go
if admin.Password != "" && admin.Password != password {
    if password != "admin" { // Dev bypass
        return nil, fmt.Errorf("invalid credentials")
    }
}
```

This bypass applies to administrators only and has no customer equivalent. It is dev-only scaffolding and should be removed before any real deployment.

### Google-only accounts

A customer created through the Google OAuth flow has an **empty** password. Because the login code only compares the password when it is non-empty, such an account can be logged in with any password value. The seeded data does not include any of these; the row for `virul.mmeemana@gmail.com` in the local database is an example of one created during testing.

