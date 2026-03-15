# Consul Health Check Endpoints

This document provides information about the health check endpoints used by HashiCorp Consul to monitor the status of microservices in the Makabasla v2 project.

## Overview

Each microservice in the Makabasla v2 project is responsible for registering itself with Consul upon startup. As part of this registration, a health check is configured to ensure that Consul only directs traffic to healthy instances of the service.

## Configuration

The health checks are configured in the `internal/discovery/consul.go` file within each service.

### Default Endpoint

The default health check endpoint for all Go-based microservices is consistently mapped to:

`GET /actuator/health`

This endpoint follows the Spring Boot Actuator naming convention to maintain compatibility with existing patterns from the previous Java implementation.

### Check Parameters

The following parameters are used for the HTTP health check:

| Parameter | Value | Description |
|-----------|-------|-------------|
| **HTTP** | `http://<service-name>:<port>/actuator/health` | The full URL Consul will poll. |
| **Interval** | `10s` | How often Consul performs the check. |
| **Timeout** | `5s` | How long Consul waits for a response before marking the check as failed. |

## Implementation Details (Go)

In the Go implementation (`internal/discovery/consul.go`), the registration structure is defined as follows:

```go
registration := &api.AgentServiceRegistration{
    ID:      c.serviceID,
    Name:    cfg.AppName,
    Port:    port,
    Address: cfg.AppName,
    Check: &api.AgentServiceCheck{
        HTTP:     fmt.Sprintf("http://%s:%d/actuator/health", cfg.AppName, port),
        Interval: "10s",
        Timeout:  "5s",
    },
}
```

The endpoint is served by the Echo/Fiber framework in the handler layer:

```go
func (h *Handler) HealthCheck(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{
        "status": "UP",
    })
}
```

## Troubleshooting

If a service is marked as "critical" (red) in the Consul UI:

1.  **Check Service Logs**: Ensure the service is running and listening on the expected port.
2.  **Verify Endpoint**: Try to access the `/actuator/health` endpoint manually from within the network or via the host (if ports are mapped).
    ```bash
    curl http://localhost:<service-port>/actuator/health
    ```
3.  **Network Connectivity**: Ensure the Consul agent can reach the microservice container on the `makabasla-network`.
4.  **Consul UI**: Visit [http://localhost:8500](http://localhost:8500) and click on the specific service to see the detailed error message (e.g., "Connection refused" or "HTTP 404").

## List of Service Health Endpoints

| Service | Container Name | Port | Health Check URL |
|---------|-------------------|------|------------------|
| API Gateway | `makabasla-gateway` | 8080 | `http://makabasla-gateway:8080/actuator/health` |
| Billing Service | `makabasla-billing-service` | 8083 | `http://makabasla-billing-service:8083/actuator/health` |
| IAM Service | `makabasla-iam-service` | 8084 | `http://makabasla-iam-service:8084/actuator/health` |
| Appointment Service | `makabasla-appointment-service` | 8085 | `http://makabasla-appointment-service:8085/actuator/health` |
| Task Mgt Service | `makabasla-task-mgt-service` | 8086 | `http://makabasla-task-mgt-service:8086/actuator/health` |
| Webstore Service | `makabasla-webstore-service` | 8087 | `http://makabasla-webstore-service:8087/actuator/health` |
