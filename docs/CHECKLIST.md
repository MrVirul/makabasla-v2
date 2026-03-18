# Deployment & Validation Checklist

Always review this checklist before deploying updates to the Makabasla Go Microservices.

## ✅ Development Checklist

### 1. Code Checks
- [ ] Updated `go 1.26` in all relevant `go.mod` files
- [ ] Ran `go mod tidy` in all service directories
- [ ] Addressed any linter/vet warnings locally via `go vet ./...`

### 2. Functional Testing
- [ ] Ensure Consul UI is reachable at `http://localhost:8500`
- [ ] All 6 microservices have correctly registered within Consul without warning states
- [ ] API Gateway correctly intercepts paths on `http://localhost:8080/`
- [ ] Service-to-service communication paths succeed

### 3. Database Readiness
- [ ] `setup-databases.sql` effectively runs when PostgreSQL volume is wiped
- [ ] The `billingdb`, `appointmentdb`, `taskdb`, and `webstoredb` instances initialize properly
- [ ] Go struct schemas mapped to logical PostgreSQL domains migrate/sync properly

## 🌐 Docker & Compose

### 4. Build Pipelines
- [ ] Using exact build arguments for `golang:1.26-alpine` inside Multi-Stage Dockerfiles
- [ ] Compose networking properly bridges the `postgres`, `consul`, and microservice containers using the `makabasla-network`

### 5. Environment Variables
- Ensure runtime environments defined in `compose.yaml` explicitly outline:
  - `DB_URL` (using valid `postgres://` formats with proper hosts)
  - `DB_USER` and `DB_PASSWORD` (used by Go services for connection/auth)
  - `CONSUL_HOST` (set to `consul` for DNS resolution inside Compose)

## 🩺 Production Diagnostics

### Logs
- Can check Docker logs reliably using: `docker-compose logs -f iam-service`
