# Architecture Diagram

The Makabasla v2 architecture has been modernized from Java to Go to minimize memory footprint and improve performance.

## Microservices Topology

```text
┌─────────────────────────────────┐
│        Frontend / Client        │
└───────────────┬─────────────────┘
                │ HTTP Requests
                ▼
┌─────────────────────────────────┐
│          API Gateway            │
│          (Port 8080)            │
│  Validates & Routes Requests    │
└──────┬───────────────────┬──────┘
       │                   │
       │ API Routing       │ Service Discovery
       ▼                   ▼
┌────────────┐      ┌─────────────┐
│ Consul Reg.│      │  Consul UI  │
│ Services   │◀────▶│ (Port 8500) │
└────────────┘      └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Go Microservices (HTTP & gRPC)             │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ IAM Service │ Billing Svc │ Appointment │ Task Mgt Svc  │ (Webstore
│ (Port 8084) │(gRPC :8083) │ (Port 8085) │ (Port 8086)   │  Port 8087)
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬────────┘
       │             │             │             │
       ▼             ▼             ▼             ▼
  (Consul Only) ┌─────────┐   ┌─────────┐   ┌─────────┐
                │ billing │   │ appoint │   │  task   │
                │   db    │   │ ment db │   │   db    │
                └────┬────┘   └────┬────┘   └────┬────┘
                     │             │             │
                     ▼             ▼             ▼
                ┌────────────────────────────────────┐
                │    PostgreSQL Server (Port 5432)   │
                └────────────────────────────────────┘
```

## Service Details

### API Gateway (Port 8080)
Acts as the entry point for all client requests. It resolves internal IP addresses and load balances between service instances utilizing HashiCorp Consul.

### Consul (Port 8500)
Provides distributed service discovery and health-checking. All downstream Go services register themselves on port startup.

### Downstream Services
All services utilize Go 1.26 and connect directly to their localized logical databases within the shared PostgreSQL server container to enforce the Database-Per-Service pattern constraints. Certain services expose gRPC endpoints for high-performance internal communication.

* `iam-service`: Handles Identity & Access Management. (Port 8084)
* `keycloak`: External Identity & Access Management server. (Port 8180)
* `billing-service`: Connects to `billingdb` - Financial ledgers and invoices. (gRPC Port 8083)
* `appointment-service`: Connects to `appointmentdb` - Scheduler and calendars. (Port 8085)
* `task-mgt-service`: Connects to `taskdb` - Task orchestration. (Port 8086)
* `webstore-service`: Connects to `webstoredb` - Product catalog and e-commerce. (Port 8087)
