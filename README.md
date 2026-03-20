# Makabasla v2

Modern healthcare management system built with Spring Boot microservices and React.

## 🏗️ Project Structure

```
makabasla-v2/
├── backend-services/           # Go microservices
│   ├── shared/                # Shared logic & protos
│   ├── api-gateway/           # API gateway with JWT & CORS
│   ├── billing-service/       # Billing operations
│   ├── iam-service/           # Authentication & authorization
│   ├── appointment-service/   # Appointment scheduling
│   ├── task-mgt-service/      # Task management
│   └── webstore-service/      # Web store operations
│
├── frontend/                  # React application
│
├── docs/                      # Documentation
│   ├── SETUP_GUIDE.md        # Complete implementation guide
│   ├── QUICK_REFERENCE.md    # Command reference
│   ├── ARCHITECTURE_DIAGRAM.md # System architecture
│   ├── IMPLEMENTATION_SUMMARY.md # Overview
│   └── CHECKLIST.md          # Testing & deployment
│
└── CONTRIBUTING.md           # Contribution guidelines
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
- Keycloak: http://localhost:8180

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
- **Keycloak**: Identity provider
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
- ✅ **Keycloak/Google Auth** - Full OIDC integration with session management

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
- ✅ **Infrastructure** - Consul, Keycloak, and PostgreSQL integrated

---

**Version**: 1.1.0  
**Last Updated**: 2026-03-21  
**Status**: ✅ Active Development
