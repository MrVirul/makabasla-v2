# techContext.md

## Technologies
- **Language**: Go 1.26
- **Server Framework**: Echo (v4)
- **Service Discovery**: HashiCorp Consul
- **Identity Provider**: Keycloak 26.0
- **Database**: PostgreSQL 16 (running in containers)
- **Containerization**: Docker & Docker Compose
- **Configuration**: Viper

## Environment Setup
- **Network**: `makabasla-network` (Docker bridge)
- **Ports**:
  - API Gateway: 8080
  - Keycloak: 8180 (Admin: 9000)
  - Consul: 8500
  - Appointment Service: 8085
  - IAM Service: 8084
  - Task Mgt: 8086
  - Webstore: 8087
