package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/makabas/billing-service/config"
	"github.com/makabas/billing-service/internal/database"
	"github.com/makabas/billing-service/internal/handler"
	"github.com/makabas/billing-service/internal/repository"
	"github.com/makabas/billing-service/internal/service"
	billingpb "github.com/makabas/shared/pkg/pb/billing"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database
	db, err := database.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Warning: failed to initialize database: %v", err)
	}
	repo := repository.NewBillingRepository(db)
	svc := service.NewBillingService(repo)
	h := handler.NewBillingHandler(svc)

	lis, err := net.Listen("tcp", ":"+cfg.ServerPort)
	if err != nil {
		log.Fatalf("failed to listen on port %s: %v", cfg.ServerPort, err)
	}

	// Initialize internal REST server for monitoring/diagnostics
	e := echo.New()
	e.Use(middleware.CORS())
	e.GET("/api/v1/internal/billings", func(c echo.Context) error {
		billings, err := svc.GetAllBillings()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, billings)
	})

	grpcServer := grpc.NewServer()
	billingpb.RegisterBillingServiceServer(grpcServer, h)
	reflection.Register(grpcServer)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("Billing gRPC service is starting on port %s", cfg.ServerPort)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("failed to serve gRPC server: %v", err)
		}
	}()

	go func() {
		log.Printf("Billing REST monitoring is starting on port 8089")
		if err := e.Start(":8089"); err != nil {
			log.Printf("REST monitoring server error: %v", err)
		}
	}()

	<-quit
	log.Println("Received termination signal, stopping servers gracefully...")
	grpcServer.GracefulStop()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	e.Shutdown(ctx)
}
