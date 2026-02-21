# Microservices Quick Reference Card

## 🚀 Quick Commands

### Setup (One-time)

```bash
# Setup PostgreSQL databases
cd backend-services
psql -U postgres -f setup-databases.sql

# OR manually
psql -U postgres -c "CREATE DATABASE billingdb;"
psql -U postgres -c "CREATE DATABASE iamdb;"
psql -U postgres -c "CREATE DATABASE appointmentdb;"
psql -U postgres -c "CREATE DATABASE taskdb;"
psql -U postgres -c "CREATE DATABASE webstoredb;"
```

### Start All Services (from project root)

```bash
# Build all modules
mvn clean install

# Start Eureka first
cd backend-services/eureka-server && mvn spring-boot:run

# Then start API Gateway (in new terminal)
cd backend-services/api-gateway && mvn spring-boot:run

# Start microservices (in separate terminals)
cd backend-services/iam-service && mvn spring-boot:run
cd backend-services/appointment-service && mvn spring-boot:run
cd backend-services/task-mgt-service && mvn spring-boot:run
cd backend-services/webstore-service && mvn spring-boot:run
cd backend-services/billing-service && mvn spring-boot:run
```

### Individual Service Commands

```bash
# Eureka Server
cd backend-services/eureka-server && mvn spring-boot:run

# API Gateway
cd backend-services/api-gateway && mvn spring-boot:run

# IAM Service
cd backend-services/iam-service && mvn spring-boot:run

# Appointment Service
cd backend-services/appointment-service && mvn spring-boot:run

# Task Management Service
cd backend-services/task-mgt-service && mvn spring-boot:run

# Webstore Service
cd backend-services/webstore-service && mvn spring-boot:run

# Billing Service
cd backend-services/billing-service && mvn spring-boot:run
```

## 📍 Service URLs

| Service | URL                   | Dashboard                      |
| ------- | --------------------- | ------------------------------ |
| Eureka  | http://localhost:8761 | http://localhost:8761          |
| Gateway | http://localhost:8080 | http://localhost:8080/actuator |
| IAM     | http://localhost:8084 | http://localhost:8084/actuator |
| Appointment | http://localhost:8085 | http://localhost:8085/actuator |
| Task Mgt | http://localhost:8086 | http://localhost:8086/actuator |
| Webstore | http://localhost:8087 | http://localhost:8087/actuator |

## 🧪 API Testing

### IAM Service (Auth)

```bash
# Health check
curl http://localhost:8080/api/auth/actuator/health

# Basic auth (admin/password)
curl -u admin:password http://localhost:8080/api/auth/actuator/info
```

### Appointment Service

```bash
# Health check
curl http://localhost:8080/api/appointments/actuator/health
```

### Task Management Service

```bash
# Health check
curl http://localhost:8080/api/tasks/actuator/health
```

### Webstore Service

```bash
# Health check
curl http://localhost:8080/api/webstore/actuator/health
```

### Billing Service

```bash
# Health check (if routed through gateway)
curl http://localhost:8080/api/billing/actuator/health
```

## 🔍 Health Checks

```bash
# Check all services
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health   # Gateway
curl http://localhost:8084/actuator/health   # IAM
curl http://localhost:8085/actuator/health   # Appointment
curl http://localhost:8086/actuator/health   # Task Mgt
curl http://localhost:8087/actuator/health   # Webstore

# View registered services
curl http://localhost:8761/eureka/apps | grep "<app>"

# View gateway routes
curl http://localhost:8080/actuator/gateway/routes
```

## 🐛 Debugging

### Check Ports

```bash
# See what's running on ports
lsof -i :8761  # Eureka
lsof -i :8080  # Gateway
lsof -i :8084  # IAM
lsof -i :8085  # Appointment
lsof -i :8086  # Task Mgt
lsof -i :8087  # Webstore

# Kill process on port
kill -9 $(lsof -t -i:8080)
```

### PostgreSQL

```bash
# Check if running
pg_isready

# Start PostgreSQL
brew services start postgresql@14

# Connect to database
psql -U postgres -d appointmentdb

# List databases
psql -U postgres -c "\l"

# Drop and recreate database
psql -U postgres -c "DROP DATABASE appointmentdb;"
psql -U postgres -c "CREATE DATABASE appointmentdb;"
```

## ⚙️ Configuration

### Change Ports

Edit `application.yml` in each service:

```yaml
server:
  port: YOUR_PORT
```

### Change Database

Edit `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/DBNAME
    username: YOUR_USERNAME
    password: YOUR_PASSWORD
```

### Enable JWT Filter

Edit `api-gateway/src/main/resources/application.yml`:

```yaml
routes:
  - id: iam-service
    filters:
      - JwtAuthenticationFilter # Add this
```

## 📊 Monitoring

### Eureka Dashboard

- **URL**: http://localhost:8761
- **Shows**: All registered services, instances, status

### Actuator Endpoints

```bash
# Health
curl http://localhost:8080/actuator/health

# Info
curl http://localhost:8080/actuator/info

# Metrics
curl http://localhost:8084/actuator/metrics

# Gateway Routes
curl http://localhost:8080/actuator/gateway/routes

# All endpoints
curl http://localhost:8080/actuator
```

## 🔄 Development Workflow

1. **Make changes** to your service
2. **Stop** the service (Ctrl+C)
3. **Rebuild**: `mvn clean install`
4. **Restart**: `mvn spring-boot:run`
5. **Verify** in Eureka: http://localhost:8761

## 🆘 Common Issues

### Service not registering

- ✅ Ensure Eureka is running first
- ✅ Wait 30 seconds after starting
- ✅ Check `defaultZone` in application.yml

### Can't connect to database

- ✅ Check PostgreSQL is running: `pg_isready`
- ✅ Verify database exists: `psql -U postgres -l`
- ✅ Check credentials in application.yml

### Port already in use

- ✅ Check ports: `lsof -i :PORT`
- ✅ Kill process: `kill -9 $(lsof -t -i:PORT)`

### 503 Service Unavailable

- ✅ Check service is registered in Eureka
- ✅ Restart API Gateway after services are up
- ✅ Check service URL pattern in gateway config
- ✅ Note: API Gateway routes for appointment, task, webstore may need to be added

## 📁 Project Structure

```
makabasla-v2/
├── pom.xml                    # Parent POM (makabasla-parent)
├── backend-services/
│   ├── eureka-server/         # Port 8761
│   ├── api-gateway/           # Port 8080
│   ├── iam-service/           # Port 8084
│   ├── appointment-service/   # Port 8085
│   ├── task-mgt-service/      # Port 8086
│   ├── webstore-service/     # Port 8087
│   ├── billing-service/      # Billing operations
│   ├── setup-databases.sql   # DB setup script
│   └── README.md
└── docs/                      # Documentation
```

## 🔗 Documentation

- [Full Setup Guide](SETUP_GUIDE.md)
- [README](README.md)
- [Architecture Diagram](ARCHITECTURE_DIAGRAM.md)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Netflix Eureka](https://cloud.spring.io/spring-cloud-netflix/reference/html/)

---

**Happy Coding! 🚀**
