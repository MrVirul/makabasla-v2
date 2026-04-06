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
	e.Any("/api/auth/*", NewProxy("http://iam-service:8084", "/api/auth"))            // IAM maps to auth here
	e.Any("/api/appointment/*", NewProxy("http://appointment-service:8085", "/api/appointment"))
	e.Any("/api/task/*", NewProxy("http://task-mgt-service:8086", "/api/task"))
	e.Any("/api/webstore/*", NewProxy("http://webstore-service:8087", "/api/webstore"))

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
