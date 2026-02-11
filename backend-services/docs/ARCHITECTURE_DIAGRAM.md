# Microservices Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│                    (localhost:3000/5173)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      API Gateway                                 │
│                   (localhost:8080)                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Features:                                              │    │
│  │  • CORS Configuration                                   │    │
│  │  • JWT Authentication Filter                            │    │
│  │  • Global Logging Filter                                │    │
│  │  • Load Balancing (Round Robin)                         │    │
│  │  • Route: /api/users/**  → USER-SERVICE                │    │
│  │  • Route: /api/orders/** → ORDER-SERVICE               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Service Discovery
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Eureka Server                                 │
│                   (localhost:8761)                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Service Registry:                                      │    │
│  │  ✓ API-GATEWAY         (1 instance)                    │    │
│  │  ✓ USER-SERVICE        (1+ instances)                  │    │
│  │  ✓ ORDER-SERVICE       (1+ instances)                  │    │
│  │  ✓ BILLING-SERVICE     (1+ instances)                  │    │
│  │  ✓ IAM-SERVICE         (1+ instances)                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Load Balanced
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ User Service  │ │ Order Service │ │Other Services │
│ (Port 8081)   │ │ (Port 8082)   │ │ (Port 808X)   │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ • CRUD Users  │ │ • CRUD Orders │ │ • Billing     │
│ • JPA/Hibernate│ │• User Orders  │ │ • IAM/Auth    │
│ • Actuator    │ │ • Actuator    │ │ • Etc...      │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  PostgreSQL   │ │  PostgreSQL   │ │  PostgreSQL   │
│    userdb     │ │   orderdb     │ │   otherdb     │
│ (Port 5432)   │ │ (Port 5432)   │ │ (Port 5432)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Request Flow

```
1. React sends: GET /api/users/1
   ↓
2. API Gateway receives request
   ↓
3. CORS Check (Allow localhost:3000, localhost:5173)
   ↓
4. Global Logging Filter logs request
   ↓
5. Route matching: /api/users/** matches user-service route
   ↓
6. Gateway queries Eureka: "Where is USER-SERVICE?"
   ↓
7. Eureka returns: [instance1: localhost:8081, instance2: localhost:8091]
   ↓
8. Load Balancer selects instance (Round Robin)
   ↓
9. Gateway rewrites path: /api/users/1 → /users/1
   ↓
10. Forward to: http://localhost:8081/users/1
    ↓
11. User Service processes request
    ↓
12. Query PostgreSQL userdb
    ↓
13. Return user data
    ↓
14. API Gateway logs response
    ↓
15. Return to React Frontend
```

## Service Communication

```
┌──────────────┐
│   Gateway    │
└──────┬───────┘
       │
       │ lb://USER-SERVICE/users/1
       ▼
┌──────────────┐     ┌──────────────┐
│    Eureka    │────▶│UserService:1 │ http://localhost:8081
└──────────────┘     │UserService:2 │ http://localhost:8091
                     └──────────────┘
                     Load Balanced!
```

## Port Allocation

| Service         | Port | Protocol | Purpose           |
| --------------- | ---- | -------- | ----------------- |
| Eureka Server   | 8761 | HTTP     | Service Discovery |
| API Gateway     | 8080 | HTTP     | API Gateway       |
| User Service    | 8081 | HTTP     | User Management   |
| Order Service   | 8082 | HTTP     | Order Management  |
| Billing Service | 8083 | HTTP     | Billing (Future)  |
| IAM Service     | 8084 | HTTP     | Auth (Future)     |
| PostgreSQL      | 5432 | TCP      | Database          |

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                  Spring Boot 3.2.2                      │
│                  Spring Cloud 2023.0.0                  │
│                  Java 21                                │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Discovery   │ │    Gateway    │ │   Services    │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ Netflix       │ │ Spring Cloud  │ │ Spring Web    │
│ Eureka        │ │ Gateway       │ │ Spring Data   │
│ Server        │ │               │ │ JPA           │
│               │ │ JWT           │ │ PostgreSQL    │
│               │ │ (JJWT 0.12.3) │ │ Lombok        │
│               │ │               │ │ Actuator      │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  userdb  │  │ orderdb  │  │billingdb │  ...       │
│  ├──────────┤  ├──────────┤  ├──────────┤            │
│  │          │  │          │  │          │            │
│  │  users   │  │  orders  │  │ invoices │            │
│  │ ──────── │  │ ──────── │  │ ──────── │            │
│  │ •id      │  │ •id      │  │ •id      │            │
│  │ •name    │  │ •userId  │  │ •orderId │            │
│  │ •email   │  │ •product │  │ •amount  │            │
│  │ •phone   │  │ •quantity│  │ •status  │            │
│  │          │  │ •price   │  │          │            │
│  │          │  │ •date    │  │          │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  Database Per Service Pattern                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Options

### Local Development (Current)

```
MacBook
├── Eureka Server   (Java Process)
├── API Gateway     (Java Process)
├── User Service    (Java Process)
├── Order Service   (Java Process)
└── PostgreSQL      (Background Service)
```

### Docker (Future)

```
Docker Compose
├── eureka-server:latest
├── api-gateway:latest
├── user-service:latest
├── order-service:latest
└── postgres:14
```

### Kubernetes (Future)

```
K8s Cluster
├── eureka-server    (Deployment + Service)
├── api-gateway      (Deployment + Service + Ingress)
├── user-service     (Deployment + Service + HPA)
├── order-service    (Deployment + Service + HPA)
└── postgres         (StatefulSet + PVC)
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│                  Eureka Dashboard                       │
│               http://localhost:8761                     │
│  • View all registered services                        │
│  • Instance health status                              │
│  • Service metadata                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Spring Boot Actuator                       │
│  • /actuator/health    - Health status                 │
│  • /actuator/metrics   - Application metrics           │
│  • /actuator/info      - Application info              │
│  • /actuator/gateway/routes - Gateway routes (8080)    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Service Logs                            │
│  • logs/eureka.log     - Eureka Server                 │
│  • logs/gateway.log    - API Gateway                   │
│  • logs/user-service.log - User Service                │
│  • logs/order-service.log - Order Service              │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ 1. HTTPS (Production)
                          │ 2. JWT Token in Headers
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                          │
│  ┌────────────────────────────────────────────────┐   │
│  │  Security Filters:                              │   │
│  │  1. CORS Filter (localhost:3000, localhost:5173)│   │
│  │  2. JWT Authentication Filter                   │   │
│  │     • Validates token signature                 │   │
│  │     • Extracts user claims                      │   │
│  │     • Adds X-User-Id header                     │   │
│  │  3. Rate Limiting (Optional)                    │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ Internal Network
                          │ X-User-Id Header
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Microservices                          │
│  • Trust X-User-Id from Gateway                        │
│  • No direct external access (Production)              │
│  • Database connection pooling                         │
└─────────────────────────────────────────────────────────┘
```

## File Structure Summary

```
backend-services/
├── eureka-server/           (15+ files)
├── api-gateway/             (20+ files)
├── user-service/            (18+ files)
├── order-service/           (18+ files)
├── billing-service/         (existing)
├── iam-service/             (existing)
├── logs/                    (generated)
├── start-all.sh            ✓
├── stop-all.sh             ✓
├── test-services.sh        ✓
├── setup-databases.sh      ✓
├── setup-databases.sql     ✓
├── README.md               ✓
├── QUICK_REFERENCE.md      ✓
├── IMPLEMENTATION_SUMMARY.md ✓
└── .gitignore              ✓

Total: 4 services + 3 automation scripts + 4 docs = Ready to run!
```

---

**Architecture Version**: 1.0  
**Created**: 2026-02-11  
**Technology**: Spring Boot 3.2.2, Spring Cloud 2023.0.0, Java 21
