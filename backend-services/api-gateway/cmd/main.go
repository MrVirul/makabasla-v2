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
	mw "github.com/makabas/api-gateway/internal/middleware"
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
		if strings.HasPrefix(req.URL.Path, prefixToRemove) {
			req.URL.Path = strings.TrimPrefix(req.URL.Path, prefixToRemove)
		}
		if req.URL.Path == "" {
			req.URL.Path = "/"
		}

		req.Host = url.Host
		proxy.ServeHTTP(res, req)
		return nil
	}
}

func main() {
	cfg := config.LoadConfig()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	
	// Global CORS configuration matches previous Spring Cloud Gateway
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// Apply JWT authentication
	// The frontend routes under /api will be intercepted by the JWT middleware, except for some ignored paths.
	e.Use(mw.JwtAuthMiddleware(cfg.JwtSecret))

	e.GET("/actuator/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "UP", "service": "api-gateway"})
	})

	// Service Routes mapping the Docker hostnames and proxying requests.
	// We map the incoming path prefix, remove it, and forward to the root of the targeted service.
	e.Any("/api/users/*", NewProxy("http://user-service:8081", "/api/users"))
	e.Any("/api/orders/*", NewProxy("http://order-service:8082", "/api/orders"))
	e.Any("/api/billing/*", NewProxy("http://billing-service:8083", "/api/billing"))
	e.Any("/api/auth/*", NewProxy("http://iam-service:8084", "/api/auth"))            // IAM maps to auth here
	e.Any("/api/appointment/*", NewProxy("http://appointment-service:8085", "/api/appointment"))
	e.Any("/api/task/*", NewProxy("http://task-mgt-service:8086", "/api/task"))
	e.Any("/api/webstore/*", NewProxy("http://webstore-service:8087", "/api/webstore"))

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
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
