# Consul Health Check Endpoints

This document provides information about the health check endpoints used by HashiCorp Consul to monitor the status of microservices in the Makabasla v2 project.

## Overview

Each microservice in the Makabasla v2 project is responsible for registering itself with Consul upon startup. As part of this registration, a health check is configured to ensure that Consul only directs traffic to healthy instances of the service.

## Configuration

The health checks are configured in the `internal/discovery/consul.go` file within each service.

### Default Endpoint

The default health check endpoint for all Go-based microservices is consistently mapped to:

`GET /health`

Previously, this followed the Spring Boot convention (`/actuator/health`), but it has been simplified to `/health` as part of the pure Go Echo migration.

### Check Parameters

The following parameters are used for the HTTP health check:

| Parameter | Value | Description |
|-----------|-------|-------------|
| **HTTP** | `http://<service-name>:<port>/health` | The full URL Consul will poll. |
| **Interval** | `10s` | How often Consul performs the check. |
| **Timeout** | `5s` | How long Consul waits for a response before marking the check as failed. |

## Implementation Details (Go)

### Consul Registration
In the Go implementation (`internal/discovery/consul.go`), the registration structure uses the `APP_NAME` (configured in `compose.yaml` to match the lowercase service name) as the address:

```go
registration := &api.AgentServiceRegistration{
    ID:      c.serviceID,
    Name:    cfg.AppName,
    Port:    port,
    Address: cfg.AppName, // Must resolve in Docker DNS
    Check: &api.AgentServiceCheck{
        HTTP:     fmt.Sprintf("http://%s:%d/health", cfg.AppName, port),
        Interval: "10s",
        Timeout:  "5s",
    },
}
```

### Echo Handler
The endpoint is served by the Echo framework in the handler layer:

```go
func (h *Handler) HealthCheck(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{
        "status": "UP",
    })
}
```

### Security Considerations (Middleware)
If a service uses global authentication middleware (like `BasicAuth` in `iam-service`), a **Skipper** must be added to allow Consul to perform health checks without providing credentials:

```go
e.Use(middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
    Skipper: func(c echo.Context) bool {
        return c.Path() == "/health"
    },
    // ... validator
}))
```

## Troubleshooting

If a service is marked as "critical" (red) in the Consul UI:

1.  **Check Service Logs**: Ensure the service is running and listening on the expected port.
2.  **Verify Endpoint**: Try to access the `/health` endpoint manually from within the network:
    ```bash
    curl http://localhost:<service-port>/health
    ```
3.  **DNS Resolution**: Ensure `APP_NAME` in `compose.yaml` matches the service name so Consul can resolve the hostname.
4.  **Auth Issues**: If you see `401 Unauthorized` in the service logs for `/health`, ensure your security middleware is configured with a Skipper for the health check path.

## List of Service Health Endpoints

| Service | Docker Service Name | Port | Health Check URL |
|---------|---------------------|------|------------------|
| API Gateway | `api-gateway` | 8080 | `http://api-gateway:8080/health` |
| Billing Service | `billing-service` | 8083 | `http://billing-service:8083/health` |
| IAM Service | `iam-service` | 8084 | `http://iam-service:8084/health` |
| Appointment Service | `appointment-service` | 8085 | `http://appointment-service:8085/health` |
| Task Mgt Service | `task-mgt-service` | 8086 | `http://task-mgt-service:8086/health` |
| Webstore Service | `webstore-service` | 8087 | `http://webstore-service:8087/health` |
