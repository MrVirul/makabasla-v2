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
	"github.com/makabas/task-mgt-service/config"
	"github.com/makabas/task-mgt-service/internal/database"
	"github.com/makabas/shared/pkg/discovery"
	"github.com/makabas/task-mgt-service/internal/handler"
	"github.com/makabas/task-mgt-service/internal/repository"
	"github.com/makabas/task-mgt-service/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Warning: failed to initialize database: %v", err)
	}



	repo := repository.NewTaskRepository(db)
	svc := service.NewTaskService(repo)
	h := handler.NewTaskHandler(svc)

	e := echo.New()
	e.Use(middleware.Recover())

	h.RegisterRoutes(e)

	// Register with Consul for service discovery
	registry, err := discovery.NewConsulRegistry(cfg.ConsulHost, cfg.ConsulPort)
	if err != nil {
		log.Fatalf("Failed to create Consul registry: %v", err)
	}
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
		log.Printf("Task Management Service is starting on port %s", cfg.ServerPort)
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
