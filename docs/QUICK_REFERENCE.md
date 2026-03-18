# Quick Reference Commands

## Orchestration (Docker Compose)

### Start entire stack
```bash
# Starts Postgres, Consul, API Gateway, and all connected services
docker-compose --file compose.yaml up --build -d
```

### Stop entire stack
```bash
docker-compose --file compose.yaml down
```

### Stop entire stack AND wipe Database State
```bash
docker-compose --file compose.yaml down -v
```

### Watch logs for all services
```bash
docker-compose --file compose.yaml logs -f
```

## Go Development commands

### Install latest packages
```bash
# Required whenever pulling new code containing modified module dependencies
cd backend-services/<service-name>
go mod tidy
```

### Run specific service locally
```bash
# Make sure Consul/Postgres are available on localhost
cd backend-services/<service-name>
go run cmd/main.go
```

## Connectivity References

### Consul UI Dashboard
[http://localhost:8500](http://localhost:8500)

### API Gateway Port Mapping
Requests flow through `http://localhost:8080`

### Keycloak Port Configuration
Accessible via `http://localhost:8180` (Configured to avoid conflict with API Gateway)

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

docker-compose --file compose.yaml up -d --build
```
