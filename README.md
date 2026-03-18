# Makabasla v2

Modern healthcare management system built with Spring Boot microservices and React.

## 🏗️ Project Structure

```
makabasla-v2/
├── backend-services/           # Go microservices
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

- **Go**: 1.26
- **Echo**: HTTP server/router
- **PostgreSQL**: Database
- **Consul**: Service discovery
- **Keycloak**: Identity provider
- **JWT**: Authentication (gateway)

### Frontend

- **React**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling

## ⚡ Features

- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **Service Discovery** - Automatic service registration with Eureka
- ✅ **API Gateway** - Centralized routing and security
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Load Balancing** - Automatic request distribution
- ✅ **CORS Support** - Configured for frontend integration
- ✅ **Health Monitoring** - Actuator endpoints on all services
- ✅ **Database Per Service** - Proper data isolation

## 📖 Getting Started

### Prerequisites

- **Go 1.26** - For backend services
- **Node.js 18+** - For frontend
- **PostgreSQL** - Database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/makabasla-v2.git
   cd makabasla-v2
   ```

2. **Start backend services**

   ```bash
   cd backend-services
   ./setup-databases.sh
   ./start-all.sh
   ```

3. **Start frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Verify installation**
   - API Gateway: http://localhost:8080
   - Frontend: http://localhost:3000

## 🧪 Testing

```bash
# Backend tests
cd backend-services
./test-services.sh

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

feat(iam-service): add JWT refresh token rotation
fix(billing-service): handle null invoice on payment retry
docs(api-gateway): update route configuration README
```

## 📝 Project Status

- ✅ **API Gateway** - Complete with auth + CORS + routing
- ✅ **Billing Service** - Project initialized with Docker
- ✅ **IAM Service** - Project initialized with Security & Docker
- ✅ **Appointment Service** - Project initialized with Docker
- ✅ **Task Management Service** - Project initialized with Docker
- ✅ **Webstore Service** - Project initialized with Docker

## 🆘 Support

- **Backend Issues**: See [Backend README](backend-services/README.md)
- **Documentation**: Check [docs/](docs/) folder
- **Quick Commands**: [Quick Reference](docs/QUICK_REFERENCE.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development Team** - [Your Team Name]

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-11  
**Status**: ✅ Active Development
