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
│  │  • Route: /api/auth/**     → IAM-SERVICE                │    │
│  │  • Route: /api/billing/**  → BILLING-SERVICE            │    │
│  │  • Service Discovery Locator (dynamic routes)          │    │
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
│  │  ✓ IAM-SERVICE         (1+ instances)                  │    │
│  │  ✓ APPOINTMENT-SERVICE (1+ instances)                  │    │
│  │  ✓ TASK-MGT-SERVICE    (1+ instances)                  │    │
│  │  ✓ WEBSTORE-SERVICE    (1+ instances)                  │    │
│  │  ✓ BILLING-SERVICE     (when Eureka-enabled)           │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Load Balanced
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ IAM Service   │ │ Appointment   │ │ Task Mgt      │ │ Webstore      │
│ (Port 8084)   │ │ (Port 8085)   │ │ (Port 8086)   │ │ (Port 8087)   │
├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤
│ • Auth        │ │ • Appointments│ │ • Tasks       │ │ • Products    │
│ • Actuator    │ │ • JPA/Postgres│ │ • JPA/Postgres│ │ • JPA/Postgres│
│               │ │ • Actuator    │ │ • Actuator    │ │ • Actuator    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  (No DB)      │ │  PostgreSQL   │ │  PostgreSQL   │ │  PostgreSQL   │
│               │ │ appointmentdb │ │   taskdb      │ │ webstoredb    │
│               │ │ (Port 5432)   │ │ (Port 5432)   │ │ (Port 5432)   │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

## Request Flow

```
1. React sends: GET /api/auth/actuator/health
   ↓
2. API Gateway receives request
   ↓
3. CORS Check (Allow localhost:3000, localhost:5173)
   ↓
4. Global Logging Filter logs request
   ↓
5. Route matching: /api/auth/** matches iam-service route
   ↓
6. Gateway queries Eureka: "Where is IAM-SERVICE?"
   ↓
7. Eureka returns: [instance: localhost:8084]
   ↓
8. Load Balancer selects instance (Round Robin)
   ↓
9. Gateway rewrites path: /api/auth/actuator/health → /actuator/health
   ↓
10. Forward to: http://localhost:8084/actuator/health
    ↓
11. IAM Service processes request
    ↓
12. Return response
    ↓
13. API Gateway logs response
    ↓
14. Return to React Frontend
```

## Service Communication

```
┌──────────────┐
│   Gateway    │
└──────┬───────┘
       │
       │ lb://IAM-SERVICE/...
       ▼
┌──────────────┐     ┌──────────────┐
│    Eureka    │────▶│ IAM-SERVICE   │ http://localhost:8084
└──────────────┘     │ APPOINTMENT  │ http://localhost:8085
                     │ TASK-MGT     │ http://localhost:8086
                     │ WEBSTORE     │ http://localhost:8087
                     └──────────────┘
                     Load Balanced!
```

## Port Allocation

| Service           | Port | Protocol | Purpose              |
| ----------------- | ---- | -------- | -------------------- |
| Eureka Server     | 8761 | HTTP     | Service Discovery    |
| API Gateway       | 8080 | HTTP     | API Gateway          |
| IAM Service       | 8084 | HTTP     | Auth & Identity      |
| Appointment Service | 8085 | HTTP   | Appointment Booking  |
| Task Mgt Service  | 8086 | HTTP     | Task Management      |
| Webstore Service  | 8087 | HTTP     | Web Store            |
| Billing Service   | TBD  | HTTP     | Billing (standalone)  |
| PostgreSQL        | 5432 | TCP      | Database             |

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                  Spring Boot 3.2.2 / 4.0.2              │
│                  Spring Cloud 2023.0.0                  │
│                  Java 21                                │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Discovery   │ │    Gateway     │ │   Services    │
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
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │appointmentdb│ │  taskdb  │  │webstoredb│  │ billingdb │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│  │          │  │          │  │          │  │          │
│  │appointments│ │  tasks   │  │ products │  │ invoices │
│  │ ──────── │  │ ──────── │  │ ──────── │  │ ──────── │
│  │ •id      │  │ •id      │  │ •id      │  │ •id      │
│  │ •...     │  │ •...     │  │ •...     │  │ •...     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘
│                                                         │
│  Database Per Service Pattern                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Options

### Local Development (Current)

```
Development Machine
├── Eureka Server   (Java Process)
├── API Gateway     (Java Process)
├── IAM Service     (Java Process)
├── Appointment Service (Java Process)
├── Task Mgt Service (Java Process)
├── Webstore Service (Java Process)
├── Billing Service  (Java Process)
└── PostgreSQL      (Background Service)
```

### Docker (Future)

```
Docker Compose
├── eureka-server:latest
├── api-gateway:latest
├── iam-service:latest
├── appointment-service:latest
├── task-mgt-service:latest
├── webstore-service:latest
├── billing-service:latest
└── postgres:14
```

### Kubernetes (Future)

```
K8s Cluster
├── eureka-server    (Deployment + Service)
├── api-gateway      (Deployment + Service + Ingress)
├── iam-service      (Deployment + Service + HPA)
├── appointment-service (Deployment + Service + HPA)
├── task-mgt-service (Deployment + Service + HPA)
├── webstore-service (Deployment + Service + HPA)
├── billing-service  (Deployment + Service + HPA)
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
makabasla-v2/
├── pom.xml                    # Parent POM
├── backend-services/
│   ├── eureka-server/         (Service Discovery)
│   ├── api-gateway/           (Gateway + Filters)
│   ├── iam-service/           (Auth)
│   ├── appointment-service/   (Appointments)
│   ├── task-mgt-service/      (Tasks)
│   ├── webstore-service/     (Web Store)
│   ├── billing-service/      (Billing)
│   ├── setup-databases.sql   ✓
│   └── README.md             ✓
└── docs/                      # Documentation
    ├── README.md             ✓
    ├── SETUP_GUIDE.md       ✓
    ├── QUICK_REFERENCE.md    ✓
    ├── ARCHITECTURE_DIAGRAM.md ✓
    ├── IMPLEMENTATION_SUMMARY.md ✓
    └── CHECKLIST.md          ✓
```

---

**Architecture Version**: 1.1  
**Last Updated**: 2026-02-21  
**Technology**: Spring Boot 3.2.2, Spring Cloud 2023.0.0, Java 21
