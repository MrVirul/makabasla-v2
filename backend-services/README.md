# Backend Microservices

A complete Spring Boot 3.x microservices architecture with service discovery, API gateway, and multiple business services.

## 🏗️ Architecture

```
React Frontend → API Gateway → Eureka Server → Microservices → PostgreSQL
```

**Technology Stack:**

- Spring Boot 3.2.2
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
# 1. Create databases
./setup-databases.sh

# 2. Start all services
./start-all.sh

# 3. Verify services
./test-services.sh
```

### Access Points

| Service       | URL                   | Purpose           |
| ------------- | --------------------- | ----------------- |
| Eureka Server | http://localhost:8761 | Service Discovery |
| API Gateway   | http://localhost:8080 | API Gateway       |
| User Service  | http://localhost:8081 | User Management   |
| Order Service | http://localhost:8082 | Order Management  |

## 📦 Services

### Infrastructure

- **[eureka-server/](eureka-server/)** - Service discovery and registration
- **[api-gateway/](api-gateway/)** - Centralized routing, CORS, JWT validation, load balancing

### Microservices

- **[user-service/](user-service/)** - User management with PostgreSQL
- **[order-service/](order-service/)** - Order management with PostgreSQL
- **[billing-service/](billing-service/)** - Billing operations
- **[iam-service/](iam-service/)** - Authentication and authorization
- **[appointment-service/](appointment-service/)** - Appointment scheduling
- **[task-mgt-service/](task-mgt-service/)** - Task management
- **[webstore-service/](webstore-service/)** - Web store operations

## 🧪 Testing

```bash
# Health checks
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # User Service
curl http://localhost:8082/actuator/health  # Order Service

# Create user via Gateway
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"1234567890"}'

# Get all users
curl http://localhost:8080/api/users

# Create order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productName":"Laptop","quantity":2,"totalPrice":2000.00}'
```

## 🛠️ Scripts

| Script                | Purpose                      |
| --------------------- | ---------------------------- |
| `start-all.sh`        | Start all services in order  |
| `stop-all.sh`         | Stop all running services    |
| `test-services.sh`    | Run comprehensive tests      |
| `setup-databases.sh`  | Create PostgreSQL databases  |
| `setup-databases.sql` | SQL database creation script |

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](../docs/) directory:

### Getting Started

- **[Setup Guide](../docs/SETUP_GUIDE.md)** - Complete implementation guide with all configuration details
- **[Quick Reference](../docs/QUICK_REFERENCE.md)** - Command cheat sheet and common operations

### Architecture & Design

- **[Architecture Diagram](../docs/ARCHITECTURE_DIAGRAM.md)** - Visual system architecture and request flow
- **[Implementation Summary](../docs/IMPLEMENTATION_SUMMARY.md)** - Overview of what was built and how to use it

### Testing & Deployment

- **[Checklist](../docs/CHECKLIST.md)** - Testing, deployment, and troubleshooting checklist

## ⚡ Key Features

- ✅ **Service Discovery** - Automatic registration with Eureka
- ✅ **Load Balancing** - Round-robin distribution via Gateway
- ✅ **CORS Support** - Configured for React (ports 3000, 5173)
- ✅ **JWT Authentication** - Ready-to-enable JWT validation filter
- ✅ **Health Monitoring** - Actuator endpoints on all services
- ✅ **Database Per Service** - Proper microservices isolation
- ✅ **Centralized Routing** - All requests through API Gateway
- ✅ **Request Logging** - Global logging filter

## 🔧 Configuration

### Port Allocation

| Service       | Port | Database  |
| ------------- | ---- | --------- |
| Eureka Server | 8761 | -         |
| API Gateway   | 8080 | -         |
| User Service  | 8081 | userdb    |
| Order Service | 8082 | orderdb   |
| Billing       | 8083 | billingdb |
| IAM Service   | 8084 | iamdb     |

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
  - id: user-service
    filters:
      - JwtAuthenticationFilter # Add this line
```

## 🐛 Troubleshooting

### Services Won't Start

- Ensure Java 21 is installed: `java -version`
- Check ports are free: `lsof -i :8761,8080,8081,8082`
- Review logs in `logs/` directory

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
2. Stop service (Ctrl+C or `./stop-all.sh`)
3. Rebuild: `mvn clean install`
4. Restart: `mvn spring-boot:run`
5. Test: `./test-services.sh`

## 📖 Additional Resources

- [Spring Cloud Gateway Documentation](https://spring.io/projects/spring-cloud-gateway)
- [Netflix Eureka Documentation](https://cloud.spring.io/spring-cloud-netflix/reference/html/)
- [Spring Boot 3.x Documentation](https://spring.io/projects/spring-boot)

## 🆘 Support

For detailed troubleshooting and advanced topics, see:

- [Setup Guide](../docs/SETUP_GUIDE.md) - Comprehensive implementation guide
- [Quick Reference](../docs/QUICK_REFERENCE.md) - Common commands and solutions
- [Checklist](../docs/CHECKLIST.md) - Testing and deployment checklist

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-11  
**Status**: ✅ Ready for Production
