# Microservices Quick Reference Card

## 🚀 Quick Commands

### Setup (One-time)

```bash
# Setup PostgreSQL databases
./setup-databases.sh

# OR manually
psql -U postgres -f setup-databases.sql
```

### Start All Services

```bash
./start-all.sh
```

### Stop All Services

```bash
./stop-all.sh
```

### Test All Services

```bash
./test-services.sh
```

### Individual Service Commands

```bash
# Eureka Server
cd eureka-server && mvn spring-boot:run

# API Gateway
cd api-gateway && mvn spring-boot:run

# User Service
cd user-service && mvn spring-boot:run

# Order Service
cd order-service && mvn spring-boot:run
```

## 📍 Service URLs

| Service | URL                   | Dashboard                      |
| ------- | --------------------- | ------------------------------ |
| Eureka  | http://localhost:8761 | http://localhost:8761          |
| Gateway | http://localhost:8080 | http://localhost:8080/actuator |
| Users   | http://localhost:8081 | http://localhost:8081/actuator |
| Orders  | http://localhost:8082 | http://localhost:8082/actuator |

## 🧪 API Testing

### User Service

```bash
# Create User
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"1234567890"}'

# Get All Users
curl http://localhost:8080/api/users

# Get User by ID
curl http://localhost:8080/api/users/1

# Update User
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","phone":"0987654321"}'

# Delete User
curl -X DELETE http://localhost:8080/api/users/1
```

### Order Service

```bash
# Create Order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productName":"Laptop","quantity":2,"totalPrice":2000.00}'

# Get All Orders
curl http://localhost:8080/api/orders

# Get Order by ID
curl http://localhost:8080/api/orders/1

# Get Orders by User ID
curl http://localhost:8080/api/orders/user/1

# Delete Order
curl -X DELETE http://localhost:8080/api/orders/1
```

## 🔍 Health Checks

```bash
# Check all services
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # Users
curl http://localhost:8082/actuator/health  # Orders

# View registered services
curl http://localhost:8761/eureka/apps | grep "<app>"

# View gateway routes
curl http://localhost:8080/actuator/gateway/routes
```

## 🐛 Debugging

### View Logs

```bash
# Live logs
tail -f logs/eureka.log
tail -f logs/gateway.log
tail -f logs/user-service.log
tail -f logs/order-service.log

# All logs
cat logs/*.log
```

### Check Ports

```bash
# See what's running on ports
lsof -i :8761  # Eureka
lsof -i :8080  # Gateway
lsof -i :8081  # Users
lsof -i :8082  # Orders

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
psql -U postgres -d userdb

# List databases
psql -U postgres -c "\l"

# Drop and recreate database
psql -U postgres -c "DROP DATABASE userdb;"
psql -U postgres -c "CREATE DATABASE userdb;"
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
  - id: user-service
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
curl http://localhost:8081/actuator/metrics

# Gateway Routes
curl http://localhost:8080/actuator/gateway/routes

# All endpoints
curl http://localhost:8080/actuator
```

## 🔄 Development Workflow

1. **Make changes** to your service
2. **Stop** the service (Ctrl+C or `./stop-all.sh`)
3. **Rebuild**: `mvn clean install`
4. **Restart**: `mvn spring-boot:run`
5. **Test**: `./test-services.sh`

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

- ✅ Stop services: `./stop-all.sh`
- ✅ Check ports: `lsof -i :PORT`
- ✅ Kill process: `kill -9 $(lsof -t -i:PORT)`

### 503 Service Unavailable

- ✅ Check service is registered in Eureka
- ✅ Restart API Gateway after services are up
- ✅ Check service URL pattern in gateway config

## 📁 Project Structure

```
backend-services/
├── eureka-server/       # Port 8761
├── api-gateway/         # Port 8080
├── user-service/        # Port 8081
├── order-service/       # Port 8082
├── billing-service/     # Port 8083
├── iam-service/         # Port 8084
├── logs/                # Service logs
├── start-all.sh         # Start script
├── stop-all.sh          # Stop script
├── test-services.sh     # Test script
└── setup-databases.sh   # DB setup script
```

## 🔗 Documentation

- [Full Setup Guide](MICROSERVICES_SETUP_GUIDE.md)
- [README](README.md)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
- [Netflix Eureka](https://cloud.spring.io/spring-cloud-netflix/reference/html/)

---

**Happy Coding! 🚀**
