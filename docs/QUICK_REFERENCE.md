# Quick Reference Commands

## Orchestration (Docker Compose)

### Start entire stack
```bash
# Starts Postgres, Consul, API Gateway, and all connected services
docker compose --file compose.yaml up --build -d
```

### Stop entire stack
```bash
docker compose --file compose.yaml down
```

### Stop entire stack AND wipe Database State
```bash
docker compose --file compose.yaml down -v
```

### Watch logs for all services
```bash
docker compose --file compose.yaml logs -f
```

## Shared Library & Protos

### Generate Go code from Protos
```bash
cd backend-services/shared
make protos
```

### Initialize Go Workspace (Monorepo)
```bash
# From the project root
go work init
go work use ./backend-services/*
```

## Go Development commands

### Install latest packages
```bash
# In any service or shared folder
go mod tidy
```

### Run specific service locally
```bash
# Make sure Consul/Postgres are available on localhost
# Run from the service directory
go run cmd/main.go
```

## Connectivity References

### Consul UI Dashboard
[http://localhost:8500](http://localhost:8500)

### API Gateway Port Mapping
Requests flow through `http://localhost:8080`

### PostgreSQL Port Configuration
Connected via TCP string on standard `5432` mappings or locally managed `DB_URL` configurations.
`DB_URL=postgres://postgres:postgres@localhost:5432/<db_name>?sslmode=disable`

### Compose DB override examples
```bash
# Override default postgres credentials for the whole stack
export POSTGRES_USER=myuser
export POSTGRES_PASSWORD=mypassword

# Override a single service DB DSN (example: billing-service)
export BILLING_DB_URL="postgres://myuser:mypassword@localhost:5432/billingdb?sslmode=disable"

docker compose --file compose.yaml up -d --build
```
