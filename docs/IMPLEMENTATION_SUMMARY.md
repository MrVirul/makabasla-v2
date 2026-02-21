# 🎉 Makabasla Microservices Implementation

## ✅ What Was Implemented

A complete **Spring Boot microservices architecture** for the Makabasla appointment booking system:

### 🏗️ Infrastructure Services

1. **Eureka Server** (Service Discovery)
   - Port: 8761
   - Dashboard UI for monitoring
   - Auto-registration and health checks
   - Location: `backend-services/eureka-server/`

2. **API Gateway** (Spring Cloud Gateway)
   - Port: 8080
   - Load balancing with Eureka
   - CORS configuration for React
   - Global logging filter
   - JWT authentication filter (ready to use)
   - Routes: /api/auth/**, /api/billing/**
   - Location: `backend-services/api-gateway/`

### 📦 Microservices

3. **IAM Service** (Identity & Access Management)
   - Port: 8084
   - Basic auth (admin/password)
   - Eureka client
   - Location: `backend-services/iam-service/`

4. **Appointment Service**
   - Port: 8085
   - PostgreSQL (appointmentdb)
   - JPA/Hibernate
   - Eureka client
   - Location: `backend-services/appointment-service/`

5. **Task Management Service**
   - Port: 8086
   - PostgreSQL (taskdb)
   - JPA/Hibernate
   - Eureka client
   - Location: `backend-services/task-mgt-service/`

6. **Webstore Service**
   - Port: 8087
   - PostgreSQL (webstoredb)
   - JPA/Hibernate
   - Eureka client
   - Location: `backend-services/webstore-service/`

7. **Billing Service**
   - Standalone Spring Boot app
   - Spring Boot 4.0.2
   - Location: `backend-services/billing-service/`

### 🛠️ Automation & Tools

8. **Database Setup**
   - `setup-databases.sql` - Creates billingdb, iamdb, appointmentdb, taskdb, webstoredb

9. **Documentation**
   - `docs/README.md` - Documentation index
   - `docs/SETUP_GUIDE.md` - Complete implementation guide
   - `docs/QUICK_REFERENCE.md` - Command reference
   - `docs/ARCHITECTURE_DIAGRAM.md` - Visual architecture
   - `docs/CHECKLIST.md` - Testing & deployment

## 🚀 How to Get Started

### Prerequisites Setup

```bash
# 1. Install dependencies (if not already installed)
brew install openjdk@21
brew install maven
brew install postgresql@14

# 2. Start PostgreSQL
brew services start postgresql@14

# 3. Create databases
cd backend-services
psql -U postgres -f setup-databases.sql
```

### Start the Microservices

**From project root:**

```bash
# Build all
mvn clean install

# Terminal 1 - Eureka
cd backend-services/eureka-server
mvn spring-boot:run

# Terminal 2 - Gateway (wait 20 seconds)
cd backend-services/api-gateway
mvn spring-boot:run

# Terminal 3 - IAM Service
cd backend-services/iam-service
mvn spring-boot:run

# Terminal 4 - Appointment Service
cd backend-services/appointment-service
mvn spring-boot:run

# Terminal 5 - Task Mgt Service
cd backend-services/task-mgt-service
mvn spring-boot:run

# Terminal 6 - Webstore Service
cd backend-services/webstore-service
mvn spring-boot:run

# Terminal 7 - Billing Service (optional)
cd backend-services/billing-service
mvn spring-boot:run
```

### Verify Services

```bash
# Eureka Dashboard
open http://localhost:8761

# Health checks
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8084/actuator/health  # IAM
curl http://localhost:8085/actuator/health  # Appointment
curl http://localhost:8086/actuator/health  # Task Mgt
curl http://localhost:8087/actuator/health  # Webstore
```

## 📊 Access Points

| Service              | URL                   | Purpose                     |
| -------------------- | --------------------- | --------------------------- |
| **Eureka Dashboard** | http://localhost:8761 | Monitor registered services |
| **API Gateway**      | http://localhost:8080 | Route all API requests      |
| **IAM Service**      | http://localhost:8084 | Auth & identity             |
| **Appointment**      | http://localhost:8085 | Appointment booking         |
| **Task Mgt**         | http://localhost:8086 | Task management             |
| **Webstore**         | http://localhost:8087 | Web store                   |

## 🎯 Key Features Implemented

### ✅ Service Discovery

- Services register with Eureka automatically
- Dynamic service discovery
- Health monitoring

### ✅ API Gateway

- Centralized routing: `/api/auth/**` → IAM Service
- Centralized routing: `/api/billing/**` → Billing Service
- Load balancing (Round Robin)
- CORS enabled for React (ports 3000, 5173)
- Global request/response logging
- JWT authentication filter (can be enabled per route)

### ✅ Database Integration

- Appointment, Task, Webstore services use PostgreSQL
- JPA/Hibernate for ORM
- Auto schema generation
- Database per service: appointmentdb, taskdb, webstoredb

### ✅ Monitoring & Health

- Actuator endpoints on all services
- Health checks: `/actuator/health`
- Metrics: `/actuator/metrics`
- Gateway routes: `/actuator/gateway/routes`

## 📁 Project Structure

```
makabasla-v2/
├── pom.xml                    # Parent POM (makabasla-parent)
├── backend-services/
│   ├── eureka-server/         # Service Discovery
│   ├── api-gateway/           # API Gateway
│   ├── iam-service/           # IAM/Auth
│   ├── appointment-service/   # Appointments
│   ├── task-mgt-service/      # Task Management
│   ├── webstore-service/      # Web Store
│   ├── billing-service/       # Billing
│   ├── setup-databases.sql    # DB setup
│   └── README.md
└── docs/
    ├── README.md
    ├── SETUP_GUIDE.md
    ├── QUICK_REFERENCE.md
    ├── ARCHITECTURE_DIAGRAM.md
    └── CHECKLIST.md
```

## 🔄 Request Flow

```
React Frontend (localhost:3000)
        ↓
    CORS Check
        ↓
API Gateway (localhost:8080)
        ↓
    Route matching (/api/auth/** or /api/billing/**)
        ↓
    Query Eureka for service instances
        ↓
    Load balance (Round Robin)
        ↓
    Forward to service
        ↓
IAM / Appointment / Task / Webstore / Billing
        ↓
    Process request
        ↓
    Query PostgreSQL (where applicable)
        ↓
    Return response
        ↓
API Gateway
        ↓
React Frontend
```

## 🔐 Security Features

### JWT Authentication (Ready to Enable)

The gateway includes a JWT authentication filter. To enable it for protected routes:

1. Update `api-gateway/src/main/resources/application.yml`:

```yaml
routes:
  - id: iam-service
    filters:
      - JwtAuthenticationFilter # Add this line
```

2. The filter will:
   - Validate JWT tokens from `Authorization: Bearer <token>` header
   - Extract user information (ID, email)
   - Forward user info to downstream services via headers
   - Return 401 for invalid/missing tokens

## 🧪 Testing Workflow

### 1. Health Checks

```bash
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8084/actuator/health  # IAM
curl http://localhost:8085/actuator/health  # Appointment
curl http://localhost:8086/actuator/health  # Task Mgt
curl http://localhost:8087/actuator/health  # Webstore
```

### 2. Service Registration

```bash
# Check Eureka Dashboard
open http://localhost:8761

# Or via API
curl http://localhost:8761/eureka/apps
```

### 3. Gateway Routes

```bash
curl http://localhost:8080/actuator/gateway/routes | jq
```

## 📈 Scaling Considerations

### Horizontal Scaling

```bash
# Start multiple instances of a service
# Instance 1
cd backend-services/appointment-service
SERVER_PORT=8085 mvn spring-boot:run

# Instance 2 (new terminal)
SERVER_PORT=8095 mvn spring-boot:run

# Gateway will automatically load balance between instances
```

### Production Recommendations

1. **Externalize Configuration** - Use Spring Cloud Config
2. **Circuit Breaker** - Add Resilience4j
3. **Distributed Tracing** - Add Zipkin/Jaeger
4. **Centralized Logging** - Use ELK stack
5. **API Documentation** - Add SpringDoc OpenAPI
6. **Database Migrations** - Use Flyway/Liquibase
7. **Containerization** - Create Dockerfiles
8. **Kubernetes** - Deploy to K8s cluster

## 🐛 Troubleshooting

### Service Not Registering

```bash
# 1. Check Eureka is running
curl http://localhost:8761

# 2. Check service logs
# Run services in foreground to see logs

# 3. Verify defaultZone in application.yml
grep defaultZone backend-services/*/src/main/resources/application.yml
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -U postgres -l | grep appointmentdb

# Test connection
psql -U postgres -d appointmentdb -c "SELECT 1;"
```

### Port Conflicts

```bash
# Find process on port
lsof -i :8080

# Kill process
kill -9 $(lsof -t -i:8080)
```

## 📚 Documentation

- **[docs/README.md](README.md)** - Documentation index
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command reference
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed implementation guide
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - System architecture

## 🎓 Next Steps

1. **Add Gateway Routes** - Configure routes for appointment, task, webstore if needed
2. **Integrate IAM Service** - Implement JWT token generation
3. **Connect React Frontend** - Use the API endpoints
4. **Add Circuit Breaker** - Implement fault tolerance
5. **Set up Monitoring** - Add Prometheus + Grafana
6. **Create Shell Scripts** - start-all.sh, stop-all.sh, test-services.sh
7. **Containerize** - Create Docker images
8. **CI/CD Pipeline** - Automate builds and deployments

---

**Version**: Spring Boot 3.2.2 / 4.0.2 | Spring Cloud 2023.0.0 | Java 21  
**Last Updated**: 2026-02-21
