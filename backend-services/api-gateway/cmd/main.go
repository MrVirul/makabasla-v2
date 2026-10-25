package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/makabas/api-gateway/config"
	gatehandler "github.com/makabas/api-gateway/internal/handler"
	"github.com/makabas/api-gateway/internal/proxy"
	"github.com/makabas/shared/pkg/discovery"
)

func NewProxy(targetHost, prefixToRemove string) echo.HandlerFunc {
	url, err := url.Parse(targetHost)
	if err != nil {
		log.Fatal(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(url)

	return func(c echo.Context) error {
		req := c.Request()
		res := c.Response()

		// Rewrite the path by removing the given prefix
		req.URL.Path = strings.TrimPrefix(req.URL.Path, prefixToRemove)
		if req.URL.Path == "" {
			req.URL.Path = "/"
		}

		// Set the Host header to the target host
		req.Host = url.Host

		// We set these headers so the downstream service knows the original request context.
		if req.Header.Get("X-Forwarded-Proto") == "" {
			req.Header.Set("X-Forwarded-Proto", "http")
		}
		if req.Header.Get("X-Forwarded-Host") == "" {
			req.Header.Set("X-Forwarded-Host", c.Request().Host)
		}
		if req.Header.Get("X-Forwarded-For") == "" {
			req.Header.Set("X-Forwarded-For", c.RealIP())
		}

		proxy.ServeHTTP(res, req)
		return nil
	}
}

func main() {
	cfg := config.LoadConfig()

	// Build a Consul-backed resolver with Docker hostnames as fallbacks so the
	// gateway still routes correctly if Consul is temporarily unavailable.
	registry, err := discovery.NewConsulRegistry(cfg.ConsulHost, cfg.ConsulPort)
	if err != nil {
		log.Fatalf("Failed to create Consul registry: %v", err)
	}

	resolver := discovery.NewResolver(registry, map[string]string{
		"iam-service":         "iam-service:8084",
		"appointment-service": "appointment-service:8085",
		"task-mgt-service":    "task-mgt-service:8086",
		"webstore-service":    "webstore-service:8087",
		"billing-service":     "billing-service:8089",
	})

	e := echo.New()
	e.Use(middleware.Recover())
	
	// Global CORS configuration matches previous Spring Cloud Gateway
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// Health endpoint (also used by the Consul health check)
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Initialize internal handlers
	billH := gatehandler.NewBillingHandler("billing-service:8083", "http://billing-service:8089")

	// Service Routes mapping the Docker hostnames and proxying requests.
	// We map the incoming path prefix, remove it, and forward to the root of the targeted service.

	// Complex/Bridged Routes
	// NOTE: /internal route must be registered BEFORE the /:vehicleId wildcard to avoid shadowing.
	e.GET("/api/billing/internal/billings", billH.GetAllBillings)
	e.GET("/api/billing/:vehicleId", billH.GetBilling)
	e.POST("/api/billing/:vehicleId", billH.StartBilling)
	e.POST("/api/billing/:vehicleId/expense", billH.AddExpense)
	e.POST("/api/billing/:vehicleId/advance", billH.AddAdvance)
	e.DELETE("/api/billing/:vehicleId", billH.DeleteBilling)

	// Direct Proxy Routes
	// The routes accept both the short form (/api/<service>/...) and the
	// frontend's double form (/api/<service>/api/v1/...). They resolve backend
	// instances via Consul with hard-coded Docker hostnames as a fallback.
	e.Any("/api/auth/*", proxy.Handler(resolver, proxy.Route{Service: "iam-service", Prefix: "/api/auth", APIBase: "/api/v1", RootPath: "/api/v1"}))
	e.Any("/api/appointment/*", proxy.Handler(resolver, proxy.Route{Service: "appointment-service", Prefix: "/api/appointment", APIBase: "/api/v1/appointment", RootPath: "/api/v1/appointment"}))
	e.Any("/api/task/*", proxy.Handler(resolver, proxy.Route{Service: "task-mgt-service", Prefix: "/api/task", APIBase: "/api/v1"}))
	e.Any("/api/webstore/*", proxy.Handler(resolver, proxy.Route{Service: "webstore-service", Prefix: "/api/webstore", APIBase: "/api/v1/webstore"}))

	// Register with Consul for service discovery
	if err := registry.Register(discovery.RegistryConfig{
		AppName:    cfg.AppName,
		AppAddress: cfg.AppName,
		AppPort:    cfg.ServerPort,
		ConsulHost: cfg.ConsulHost,
		ConsulPort: cfg.ConsulPort,
	}); err != nil {
		log.Fatalf("Failed to register with Consul: %v", err)
	}
	defer func() {
		if err := registry.Deregister(); err != nil {
			log.Printf("Failed to deregister from Consul: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		e.HideBanner = true
		e.HidePort = true
		log.Printf("API Gateway is starting on port %s", cfg.ServerPort)
		if err := e.Start(":" + cfg.ServerPort); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("Shutting down the server")
		}
	}()

	<-quit
	log.Println("Received termination signal, shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}
