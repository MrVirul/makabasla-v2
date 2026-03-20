package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/makabas/iam-service/config"
	"github.com/makabas/iam-service/internal/database"
	"github.com/makabas/iam-service/internal/discovery"
	"github.com/makabas/iam-service/internal/handler"
	"github.com/makabas/iam-service/internal/repository"
	"github.com/makabas/iam-service/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	consulClient, err := discovery.NewConsulClient(cfg)
	if err != nil {
		log.Fatalf("Warning: failed to initialize consul client: %v", err)
	}

	if err := consulClient.Register(cfg); err != nil {
		log.Printf("Warning: failed to register with consul: %v", err)
	}

	repo := repository.NewIamRepository(db)
	svc := service.NewIamService(repo)
	h := handler.NewIamHandler(svc)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Basic Auth Middleware with Skipper for health checks
	e.Use(middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
		Skipper: func(c echo.Context) bool {
			return c.Path() == "/health"
		},
		Validator: func(username, password string, c echo.Context) (bool, error) {
			if username == cfg.Username && password == cfg.Password {
				return true, nil
			}
			return false, nil
		},
	}))

	h.RegisterRoutes(e)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := e.Start(":" + cfg.ServerPort); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("Shutting down the server")
		}
	}()

	<-quit
	log.Println("Received termination signal, shutting down gracefully...")

	if err := consulClient.Deregister(); err != nil {
		log.Printf("Failed to deregister from consul: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}
