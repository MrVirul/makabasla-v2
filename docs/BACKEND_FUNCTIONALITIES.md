# 🛠️ Makabasla v2 Backend Developer Onboarding & Functionality Guide

Welcome to the **Makabasla v2** Backend Engineering team! This document is designed to get you up to speed with our lightweight, high-performance, and highly resilient Go-based microservices architecture. 

Historically, this system was built on a Java/Spring Boot monolith. We migrated the entire ecosystem to **Go 1.24+** (configured as `go 1.26` for forward-compatibility) to reduce resource footprint, drop JVM overhead, and achieve rapid startup times and sub-millisecond request latencies.

---

## 🏗️ 1. Architecture & Network Topology

The backend utilizes a **Database-Per-Service** pattern, with service discovery managed dynamically by **HashiCorp Consul**. Clients do not interact directly with leaf services; instead, all traffic flows through our high-performance **API Gateway** which handles reverse proxying, path rewriting, CORS, and gRPC bridging.

```text
                                  ┌───────────────────────────┐
                                  │   Google OAuth Provider   │
                                  └─────────────▲─────────────┘
                                                │ OAuth 2.0 (JIT Provisioning)
                                                ▼
┌─────────────────────────────────┐      ┌────────────────────────────┐
│      Web Client / Mobile App    │◀────▶│ Frontend (NextAuth.js Client)│
└───────────────┬─────────────────┘      └────────────────────────────┘
                │ HTTP API Requests
                ▼
┌─────────────────────────────────┐
│        API Gateway (Go/Echo)    │ ◄─── CORS Allowed: localhost:3000, 5173
│             [Port 8080]         │
└──────┬───────────────────┬──────┘
       │ REST proxying     │ REST-to-gRPC Bridge
       │                   ▼
       │            ┌───────────────┐
       │            │Billing Service│ ◄─── (gRPC Port 8083, REST Port 8089)
       │            │  (Go / GORM)  │      Logical DB: `billingdb`
       │            └───────┬───────┘
       ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  IAM Service  │   │Webstore Service│   │  Task Mgt Svc │   │Appointment Svc│
│  (Go / GORM)  │   │  (Go / GORM)  │   │  (Go / GORM)  │   │  (Go / Echo)  │
│  [Port 8084]  │   │  [Port 8087]  │   │  [Port 8086]  │   │  [Port 8085]  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │                   │
        ▼                   ▼                   ▼                   ▼
   (Consul Only)    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
                    │  webstoredb   │   │    taskdb     │   │ appointmentdb │
                    └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
                            ▼                   ▼                   ▼
                ┌───────────────────────────────────────────────────────────┐
                │          Shared Cloud/Local PostgreSQL (Port 5432)        │
                └───────────────────────────────────────────────────────────┘
```

### Key Communications Protocols
* **External Client Calls**: Standard JSON REST APIs passing through the Gateway over port `8080`.
* **Internal Downstream Calls**: Standard REST over local Docker bridge or high-performance, strongly-typed **gRPC** (e.g., billing operations) over port `8083`.
* **Service Registry**: Every microservice registers itself with **HashiCorp Consul** (port `8500`) on boot, complete with automated `/health` checks.

---

## 🛰️ 2. Comprehensive Service Guide

Our system is structured as six distinct, modular Go services. Below is an exhaustive reference of their functionality, database mappings, and registered endpoints.

### 🌐 A. API Gateway (`api-gateway`)
* **Role**: The centralized entrypoint. Resolves downstreams via Consul-registered hostnames and abstracts authentication/CORS away from individual services.
* **Core Technology**: Go, Echo v4 Router, standard library `httputil.ReverseProxy`.
* **Special Capabilities**:
  * **CORS Config**: Whitelists local web frameworks (`http://localhost:3000` and `http://localhost:5173`), handles preflight requests, and propagates cookies.
  * **REST-to-gRPC Bridge**: Intercepts REST billing requests, transforms parameters, and initiates synchronous, binary gRPC calls to the internal `billing-service` via multiplexed client connections.
  * **Path Rewriting**: Normalizes inbound paths, stripping routing namespaces before proxying (e.g., `/api/webstore/*` rewritten to `/*` and sent to the Webstore service).

| External Inbound Route | HTTP Method | Target Downstream (Consul Resolved) | Action Description |
| :--- | :--- | :--- | :--- |
| `/api/billing/:vehicleId` | `GET` | `billing-service` (gRPC Port 8083) | Fetches the consolidated financial billing ledger for a vehicle. |
| `/api/billing/:vehicleId` | `POST` | `billing-service` (gRPC Port 8083) | Initializes/creates a new billing record for a vehicle. |
| `/api/billing/:vehicleId/expense` | `POST` | `billing-service` (gRPC Port 8083) | Appends an expense item (e.g., labor, spare parts) to a billing card. |
| `/api/billing/:vehicleId/advance` | `POST` | `billing-service` (gRPC Port 8083) | Registers an advance prepayment received from the client. |
| `/api/billing/:vehicleId` | `DELETE` | `billing-service` (gRPC Port 8083) | Deletes a vehicle's billing records and its associated financial lines. |
| `/api/billing/internal/billings` | `GET` | `billing-service` (REST Port 8089) | Proxies to internal billing REST monitoring endpoint for analytics. |
| `/api/auth/*` | `ANY` | `iam-service` (Port 8084) | Routes login, registrations, and account profile sync requests. |
| `/api/appointment/*` | `ANY` | `appointment-service` (Port 8085) | Routes booking, schedules, and health check calls. |
| `/api/task/*` | `ANY` | `task-mgt-service` (Port 8086) | Routes task list updates and statuses for ongoing work. |
| `/api/webstore/*` | `ANY` | `webstore-service` (Port 8087) | Routes product catalog requests, search, purchasing, and sales analytics. |

---

### 🔐 B. IAM Service (`iam-service`)
* **Role**: Handles identity provision, user roles, vehicle registrations, and secure login workflows.
* **Core Technology**: Go, Echo Router, GORM, bcrypt-compatible bypass structures.
* **Logical Database Tables**: `customers`, `vehicles`, `admins`, `technicians`, `staff`.
* **Important Business Logic Rules**:
  * **JIT (Just-In-Time) Provisioning**: Integrates seamlessly with **Google OAuth 2.0** (routed from **NextAuth.js** frontend). When users authenticate via Google, a `/api/v1/profile` POST is made to sync their Google ID, profile image, name, and email. The service dynamically inserts or updates the localized `Customer`, `Admin`, `Technician`, or `Staff` record depending on the token's security role.
  * **Phone Validation**: Standard registration (`POST /api/v1/register`) strictly validates phone numbers. It enforces a **length of exactly 10 digits** consisting only of characters `'0'` to `'9'`, and checks for duplicate registrations across the database.
  * **Account Duplication Check**: Registration blocks email addresses that already have records in the system. If an email is linked to a passwordless account (previously signed in with Google), it explicitly requests the user to sign in using Google.
  * **Dev Bypass Mode**: In non-production environments, admin logins are simplified to bypass rigid hash checks if the password `"admin"` is sent, allowing developer ease of deployment.

#### Service Interface methods:
* `SyncProfile(id, email, name, phone, role, image string) (interface{}, error)`
* `GetProfile(id string) (interface{}, error)`
* `LoginCustomer(email, password string) (interface{}, error)`
* `RegisterCustomer(email, password, name, phone string) (interface{}, error)`
* `AddVehicle(vehicle *models.Vehicle) error`
* `GetVehicles(customerID string) ([]models.Vehicle, error)`

#### Endpoints:
* `POST /api/v1/register` — Standard customer enrollment (with strict phone and email validations).
* `POST /api/v1/auth/login` — Sign-in for customers (by email) or admin dashboard (by username).
* `POST /api/v1/profile` — JIT Profile Synchronization endpoint.
* `GET /api/v1/profile/:id` — Retrieve localized account data by ID.
* `POST /api/v1/vehicle` — Register a new customer vehicle (make, model, plate, etc.).
* `PUT /api/v1/vehicle` — Update vehicle details.
* `DELETE /api/v1/vehicle/:id` — Deregister a vehicle from the account.
* `GET /api/v1/vehicles` — View all vehicles.
* `GET /api/v1/customers` — Fetch a list of registered users.

---

### 🛍️ C. Webstore Service (`webstore-service`)
* **Role**: E-commerce operations, inventory management, product search, and sales analytical reporting.
* **Core Technology**: Go, Echo, GORM.
* **Logical Database Tables**: `products`, `orders`.
* **Important Business Logic Rules**:
  * **Stock Check & Decrementation**: When `BuyProduct` is executed, the database is checked. If the quantity requested exceeds available stock, it fails immediately with `"insufficient stock"` to prevent double-selling. On success, stock is subtracted, and a transaction-safe record is written into `orders`.
  * **Low Stock Alerts**: If product stock falls **below or equal to 5 units** after a purchase, the service immediately triggers an event alert in the logs:  
    `⚠️ ALERT: Low-stock notification sent for Product '...' (ID: ...). Remaining stock: ...`
  * **Analytic Accumulator**: Aggregates total items sold, total revenue, average order size, and popular items to feed the admin dashboard charts.

#### Service Interface methods:
* `GetAllProducts() ([]models.Product, error)`
* `SearchProducts(query string) ([]models.Product, error)`
* `BuyProduct(id uint, quantity int) error`
* `GetAnalytics() (map[string]interface{}, error)`

#### Endpoints:
* `GET /api/v1/webstore/products` — Lists products (supports fuzzy search via `?search=query`).
* `POST /api/v1/webstore/products` — Adds new products to the catalog (Admin only).
* `PUT /api/v1/webstore/products/:id` — Edits product prices, image URLs, description, and quantity.
* `DELETE /api/v1/webstore/products/:id` — Removes products from the inventory catalog.
* `POST /api/v1/webstore/products/:id/buy` — Executes a purchase order and handles automated low-stock warnings.
* `GET /api/v1/webstore/analytics` — Generates aggregated merchant statistics.

---

### 📋 D. Task Management Service (`task-mgt-service`)
* **Role**: Tracks internal workflow steps, repairs, service sequences, and technician progression for cars.
* **Core Technology**: Go, Echo, GORM.
* **Logical Database Tables**: `tasks`.
* **Important Business Logic Rules**:
  * **Deterministic Task Numbers**: When creating a repair task for a specific vehicle, the service queries existing tasks associated with that vehicle. It dynamically constructs a readable sequence code formatted as `TSK-{VehicleID}-{SequenceIndex}` (e.g. `TSK-104-1`, `TSK-104-2`).
  * **Status Lifecycle**: Standardizes transition across lifecycle states: `pending` ➔ `in_progress` ➔ `completed`.

#### Service Interface methods:
* `CreateTask(vehicleID uint, description string) (*database.Task, error)`
* `GetTasksByVehicleID(vehicleID uint) ([]database.Task, error)`
* `UpdateTaskStatus(taskID uint, status string) (*database.Task, error)`

#### Endpoints:
* `POST /api/v1/vehicles/:vehicle_id/tasks` — Registers a new repair or diagnostic task on a vehicle.
* `GET /api/v1/vehicles/:vehicle_id/tasks` — Lists all scheduled or completed tasks on a specific vehicle.
* `PATCH /api/v1/tasks/:task_id/status` — Updates task phase status (triggers from technician views).

---

### 💳 E. Billing Service (`billing-service`)
* **Role**: Manages active invoices, registers cash advances, registers expense line items, and maintains financial states for repair orders.
* **Core Technology**: Go, GORM, **gRPC** (via standard protobuf-compiled Go interface).
* **Logical Database Tables**: `billings`, `expenses`, `advances`.
* **Important Business Logic Rules**:
  * **Autonomous Ledgers**: A billing invoice is tied to a vehicle ID. On creation, a UUID is compiled.
  * **Balance Calculation Formula**: Balance is strictly managed on modifications via the explicit logic:  
    $$\text{BalanceDue} = \text{TotalExpenses} - \text{TotalAdvances}$$
    Whenever an expense is appended, `TotalExpenses` increments by `amount`, and `BalanceDue` updates. Whenever an advance is paid, `TotalAdvances` increments, and `BalanceDue` updates. All actions are fully logged and safely flushed via database transactions.
  * **Self-Healing Billings**: If an operator requests to append an expense or an advance to a vehicle that doesn't yet have an active billing sheet, the system automatically runs `CreateBilling(vehicleID)` first behind the scenes to avoid orphaned entries.

#### Service Interface methods:
* `GetBillingByVehicleID(vehicleID uint)`
* `CreateBilling(vehicleID uint)`
* `AddExpense(vehicleID uint, date, desc string, amount float64)`
* `AddAdvance(vehicleID uint, date, desc string, amount float64)`
* `DeleteBillingByVehicleID(vehicleID uint)`

#### RPC Interface:
Our API Gateway speaks to this service via gRPC on Port `8083`. The service implements the compiled Protobuf interface:
* `rpc GetBilling(GetBillingRequest) returns (Billing);`
* `rpc CreateBilling(CreateBillingRequest) returns (Billing);`
* `rpc AddExpense(AddExpenseRequest) returns (Billing);`
* `rpc AddAdvance(AddAdvanceRequest) returns (Billing);`
* `rpc DeleteBilling(DeleteBillingRequest) returns (DeleteResponse);`

---

### 📅 F. Appointment Service (`appointment-service`)
* **Role**: Standardized microservice skeleton ready for scheduling customer servicing and booking appointments.
* **Core Technology**: Go, Echo, GORM.
* **Endpoints**:
  * `GET /api/v1/appointment` — Processes request context and returns base scheduler details.

---

## 🛠️ 3. Shared Library & Utilities (`shared`)

To strictly enforce dry principles, any cross-cutting infrastructure is compiled inside `backend-services/shared/pkg`. This ensures identical core mechanics across all services.

### 🔌 A. Service Discovery (`shared/pkg/discovery/consul.go`)
Integrates **HashiCorp Consul** seamlessly. All microservices call `Register(cfg RegistryConfig)` on launch.
* **Health Checks**: Consul registers an active HTTP health checker endpoint on each service. The endpoint defaults to `http://<service-ip>:<port>/health`.
* **Schedule Interval**: Checked every `10s` with a `5s` HTTP timeout. If a service becomes unresponsive, Consul flags it as unhealthy and the API Gateway automatically stops forwarding requests to that node.
* **Deregistration**: Captures interrupt (`SIGINT`, `SIGTERM`) OS system signals to perform elegant cleanup, removing itself from the Consul catalog.

### 🔄 B. Shared HTTP Client (`shared/pkg/httpclient/client.go`)
Inter-service HTTP communications utilize a shared Client wrapper around `go-resty/resty/v2`.
* **Automatic Retry Policies**:
  * **Retry Limit**: `3` attempts.
  * **Retry Wait Time**: Starts at `100ms`, exponential backoff capped at a maximum of `2s`.
  * **Conditions**: Triggered on standard networking connections errors or if downstream returns standard HTTP 5xx errors (Internal Server Errors, Bad Gateway).
* **Authorization Context & Token Propagation**:
  * The system exposes an Echo middleware `ExtractTokenMiddleware()`.
  * It intercepts incoming `Authorization` headers and injects them into the standard Go `context.Context` (keyed as `"authorization_token"`).
  * Downstream REST calls initiated via this client automatically fetch the token from the context and propagate it downstream invisibly, securing inter-service calls.

### 🚨 C. Error Mapping (`shared/pkg/errors/errors.go`)
Standardizes custom application faults (`AppError`) across JSON APIs and translates them dynamically into standard gRPC models.
```go
type AppError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}
```
* Custom helper `ToGRPCStatus()` automatically translates HTTP Status codes to native gRPC code primitives:
  * `http.StatusNotFound` (404) ➔ `codes.NotFound`
  * `http.StatusUnauthorized` (401) ➔ `codes.Unauthenticated`
  * `http.StatusBadRequest` (400) ➔ `codes.InvalidArgument`
  * `http.StatusInternalServerError` (500) ➔ `codes.Internal`

---

## 📋 4. Technology Stack & Key Frameworks

* **Language Platform**: Go 1.24+ / Go 1.26
* **HTTP Framework**: [Echo v4](https://echo.labstack.com/) for extreme lightweight HTTP routing.
* **gRPC Support**: [gRPC-Go](https://grpc.io/docs/languages/go/quickstart/) for inter-service RPC messaging.
* **Database Mapping (ORM)**: [GORM](https://gorm.io/) connecting via native PostgreSQL GORM drivers.
* **Local Registry**: [HashiCorp Consul API](https://github.com/hashicorp/consul)
* **Configuration**: Centralized configuration management using YAML loaders and direct environment files (`.env`) loaded via custom structures.

---

## 🚀 5. Development Quick-Start Reference

To spin up and work on this backend, utilize the following steps.

### A. Run Local Core Infrastructure
To boot up local PostgreSQL and HashiCorp Consul UI:
```bash
docker compose --file compose.yaml up -d
```
You can view the Consul UI dashboard at: [http://localhost:8500](http://localhost:8500)

### B. Compile Shared Protobufs
If you modify protobuf contracts under `shared/proto/`:
```bash
cd backend-services/shared
make protos
```

### C. Running a Service Locally
If you want to run or debug a specific service locally outside of Docker (using your local compiler):
1. Copy or verify your `.env` variables in the root directory.
2. From the specific service directory, run:
```bash
go run cmd/main.go
```

### D. Tidy Go Dependencies
Ensure your Go workspace and mod trees are synchronized before committing:
```bash
go work sync
# Or within a service folder
go mod tidy
```
