# Makabasla v2

Modern healthcare management system built with Go microservices and a Next.js frontend.

## 🏗️ Project Structure

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

## 🚀 Quick Start

### Backend Services (Standard)

```bash
cd backend-services

# 1. Setup databases
./setup-databases.sh

# 2. Start all services
./start-all.sh

# 3. Test services
./test-services.sh
```

### Backend Services (Docker)

```bash
# Start all microservices and infrastructure with one command
docker compose up --build
```

**Access Points:**

- API Gateway: http://localhost:8080
- Consul UI: http://localhost:8500
- Google Cloud Console (OAuth setup)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) directory:

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Comprehensive implementation guide
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Command reference and examples
- **[Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)** - System architecture and design
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - What's implemented and how to use it
- **[Checklist](docs/CHECKLIST.md)** - Testing and deployment checklist

## 🛠️ Technology Stack

### Backend

- **Go**: 1.26 (Monorepo with `go.work`)
- **Echo**: HTTP server/router
- **gRPC**: Inter-service communication
- **PostgreSQL**: Database
- **Consul**: Service discovery
- **Google OAuth**: Identity provider via NextAuth
- **JWT**: Authentication (gateway)
- **Resty**: Internal HTTP client with retries

### Frontend

- **Next.js 15+**: React framework (App Router)
- **NextAuth.js**: Authentication handling
- **TailwindCSS 4**: Modern styling
- **Shadcn UI**: Premium component library
- **Lucide React**: Icon system

## ⚡ Features

- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **Service Discovery** - Automatic service registration via Consul
- ✅ **API Gateway** - Centralized routing, JWT validation & CORS
- ✅ **User Profile Sync** - Just-in-Time provisioning for customer data
- ✅ **Vehicle Management** - Customer vehicle registration system
- ✅ **Modern Dashboard** - Premium glassmorphic UI with Shadcn components
- ✅ **Google Authentication** - OAuth 2.0 integration with NextAuth.js

## 📖 Getting Started

### Prerequisites

- **Go 1.23+** - For backend services
- **Node.js 18+** - For frontend
- **Docker & Docker Compose** - Infrastructure

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MrVirul/makabasla-v2.git
   cd makabasla-v2
   ```

2. **Start backend services (Docker recommended)**

   ```bash
   docker compose up -d
   ```

3. **Start frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Verify installation**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Profile Sync: http://localhost:3000/profile

## 📝 Project Status

- ✅ **API Gateway** - Complete with auth + CORS + routing
- ✅ **IAM Service** - User Profile & Vehicle Management functional
- ✅ **Frontend** - Next.js + Tailwind 4 + Shadcn UI integration complete
- ✅ **Infrastructure** - Consul, Google OAuth, and PostgreSQL integrated

---

**Version**: 1.1.0  
**Last Updated**: 2026-03-21  
**Status**: ✅ Active Development
