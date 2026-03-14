# Local Development Setup Guide

This guide describes how to run the Makabasla v2 backend microservices locally.

## Prerequisites
- Docker and Docker Compose
- Go 1.26 (for local development outside of Docker)
- Git

## 1. Running complete stack via Docker Compose

The easiest way to run the entire backend is via Docker Compose. This spins up the PostgreSQL database, Consul server, API Gateway, and all 5 backend microservices.

```bash
docker-compose --file compose.yaml up --build -d
```

### Services Available
Once running, the following services are available:
- **API Gateway**: `http://localhost:8080`
- **Consul UI**: `http://localhost:8500`
- **PostgreSQL**: `localhost:5432`

The microservices will automatically register themselves with Consul. The API Gateway routes incoming requests to the respective upstream service automatically based on path prefixes or configurations.

## 2. Local Development (Running Go services manually)

If you need to make changes to a specific Go service, you can run the dependencies (Postgres + Consul) via Docker and run the specific Go service locally.

1. **Start infrastructure only**:
```bash
# Wait, currently there is no separate infra-only compose step, but you can target them specifically
docker-compose --file compose.yaml up -d postgres consul
```

2. **Run a specific service**:
```bash
cd backend-services/api-gateway
# First time only
go mod tidy 
# Run the service
go run cmd/main.go
```
(Repeat for `iam-service`, `appointment-service`, `billing-service`, `task-mgt-service`, `webstore-service`)

> **Note:** The Go microservices expect Consul to be available at the host defined via the `CONSUL_HOST` environment variable, and the database at `DB_URL`. If running locally, you might need to export `CONSUL_HOST=localhost` and define the relevant `DB_URL` based on your service's configuration.

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
