# Backend Microservices

A complete Spring Boot microservices architecture for the Makabasla appointment booking system, with service discovery, API gateway, and multiple business services.

## 🏗️ Architecture

```
React Frontend → API Gateway → Eureka Server → Microservices → PostgreSQL
```

**Technology Stack:**

- Spring Boot 3.2.2 (core services) / 4.0.2 (billing)
- Spring Cloud 2023.0.0
- Java 21
- PostgreSQL
- Netflix Eureka
- Spring Cloud Gateway

## 🚀 Quick Start

### Prerequisites

- Java 21
- Maven 3.8+
- PostgreSQL running on localhost:5432

### Setup & Run

```bash
# 1. Create databases (from project root)
cd backend-services
psql -U postgres -f setup-databases.sql

# 2. Build all modules (from project root)
mvn clean install

# 3. Start Eureka first
cd backend-services/eureka-server && mvn spring-boot:run

# 4. Start API Gateway (new terminal)
cd backend-services/api-gateway && mvn spring-boot:run

# 5. Start microservices (new terminals each)
cd backend-services/iam-service && mvn spring-boot:run
cd backend-services/appointment-service && mvn spring-boot:run
cd backend-services/task-mgt-service && mvn spring-boot:run
cd backend-services/webstore-service && mvn spring-boot:run

# 6. Verify at http://localhost:8761
```

### Access Points

| Service       | URL                   | Purpose           |
| ------------- | --------------------- | ----------------- |
| Eureka Server | http://localhost:8761 | Service Discovery |
| API Gateway   | http://localhost:8080 | API Gateway       |
| IAM Service   | http://localhost:8084 | Auth & Identity   |
| Appointment   | http://localhost:8085 | Appointments      |
| Task Mgt      | http://localhost:8086 | Task Management   |
| Webstore      | http://localhost:8087 | Web Store         |

## 📦 Services

### Infrastructure

- **[eureka-server/](eureka-server/)** - Service discovery and registration
- **[api-gateway/](api-gateway/)** - Centralized routing, CORS, JWT validation, load balancing

### Microservices

- **[iam-service/](iam-service/)** - Authentication and authorization
- **[appointment-service/](appointment-service/)** - Appointment scheduling (PostgreSQL)
- **[task-mgt-service/](task-mgt-service/)** - Task management (PostgreSQL)
- **[webstore-service/](webstore-service/)** - Web store operations (PostgreSQL)
- **[billing-service/](billing-service/)** - Billing operations

## 🧪 Testing

```bash
# Health checks
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8084/actuator/health  # IAM
curl http://localhost:8085/actuator/health  # Appointment
curl http://localhost:8086/actuator/health  # Task Mgt
curl http://localhost:8087/actuator/health  # Webstore

# IAM (basic auth: admin/password)
curl -u admin:password http://localhost:8080/api/auth/actuator/info

# Gateway routes
curl http://localhost:8080/actuator/gateway/routes
```

## 📚 Documentation

Comprehensive documentation is in the [`docs/`](../docs/) directory:

- **[Setup Guide](../docs/SETUP_GUIDE.md)** - Complete implementation guide
- **[Quick Reference](../docs/QUICK_REFERENCE.md)** - Command cheat sheet
- **[Architecture Diagram](../docs/ARCHITECTURE_DIAGRAM.md)** - System architecture
- **[Implementation Summary](../docs/IMPLEMENTATION_SUMMARY.md)** - What was built
- **[Checklist](../docs/CHECKLIST.md)** - Testing and deployment

## ⚡ Key Features

- ✅ **Service Discovery** - Automatic registration with Eureka
- ✅ **Load Balancing** - Round-robin distribution via Gateway
- ✅ **CORS Support** - Configured for React (ports 3000, 5173)
- ✅ **JWT Authentication** - Ready-to-enable JWT validation filter
- ✅ **Health Monitoring** - Actuator endpoints on all services
- ✅ **Database Per Service** - appointmentdb, taskdb, webstoredb
- ✅ **Centralized Routing** - All requests through API Gateway
- ✅ **Request Logging** - Global logging filter

## 🔧 Configuration

### Port Allocation

| Service           | Port | Database    |
| ----------------- | ---- | ----------- |
| Eureka Server     | 8761 | -           |
| API Gateway       | 8080 | -           |
| IAM Service       | 8084 | -           |
| Appointment       | 8085 | appointmentdb |
| Task Mgt          | 8086 | taskdb      |
| Webstore          | 8087 | webstoredb  |
| Billing           | TBD  | billingdb   |

### Database Credentials

Default PostgreSQL configuration (update in each service's `application.yml`):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/DATABASE_NAME
    username: postgres
    password: postgres
```

### Enable JWT Authentication

To enable JWT validation on routes, edit `api-gateway/src/main/resources/application.yml`:

```yaml
routes:
  - id: iam-service
    filters:
      - JwtAuthenticationFilter # Add this line
```

## 🐛 Troubleshooting

### Services Won't Start

- Ensure Java 21 is installed: `java -version`
- Check ports: `lsof -i :8761,8080,8084,8085,8086,8087`
- Run `mvn clean install` from project root

### Service Not Registering

- Verify Eureka is running: http://localhost:8761
- Wait 30 seconds after starting services
- Check `eureka.client.service-url.defaultZone` in application.yml

### Database Connection Failed

- Check PostgreSQL is running: `pg_isready`
- Verify databases exist: `psql -U postgres -l`
- Review credentials in `application.yml`

### Gateway Returns 503

- Ensure target service is registered in Eureka
- Check service status on Eureka Dashboard
- Restart API Gateway after services are up

## 🔄 Development Workflow

1. Make changes to your service
2. Stop service (Ctrl+C)
3. Rebuild: `mvn clean install`
4. Restart: `mvn spring-boot:run`
5. Verify in Eureka: http://localhost:8761

---

**Version**: 1.1.0  
**Last Updated**: 2026-02-21  
**Status**: ✅ Ready for Development
