# techContext.md

## Technologies
- **Language**: Go 1.26
- **Server Framework**: Echo (v4)
- **RPC Framework**: gRPC / Protocol Buffers
- **Service Discovery**: HashiCorp Consul
- **Identity Provider**: Google OAuth 2.0 (via NextAuth.js)
- **Database**: Cloud-based PostgreSQL (Neon DB)
- **ORM/DB access**: Gorm (with postgres driver)
- **Containerization**: Docker & Docker Compose
- **Configuration**: Viper

## Environment Setup
- **Network**: `makabasla-network` (Docker bridge)
- **Ports**:
  - API Gateway: 8080
  - Consul: 8500
  - Appointment Service: 8085
  - IAM Service: 8084
  - Billing Service: 8083
  - Task Mgt: 8086
  - Webstore: 8087
