package main

import (
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

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

	<-quit
	log.Println("Received termination signal, stopping gRPC server gracefully...")
	grpcServer.GracefulStop()
}
