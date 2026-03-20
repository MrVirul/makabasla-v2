package grpc

import (
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
)

// Server defines a standard gRPC server wrapper.
type Server struct {
	grpcServer *grpc.Server
	healthServer *health.Server
}

// NewServer creates a new gRPC server with health check and reflection enabled.
func NewServer(opts ...grpc.ServerOption) *Server {
	s := grpc.NewServer(opts...)
	
	// Register health check.
	h := health.NewServer()
	healthpb.RegisterHealthServer(s, h)
	
	// Enable reflection for tools like grpcurl.
	reflection.Register(s)

	return &Server{
		grpcServer:   s,
		healthServer: h,
	}
}

// GetGRPCServer returns the underlying grpc.Server instance.
func (s *Server) GetGRPCServer() *grpc.Server {
	return s.grpcServer
}

// SetStatus updates the health status of a service.
func (s *Server) SetStatus(service string, status healthpb.HealthCheckResponse_ServingStatus) {
	s.healthServer.SetServingStatus(service, status)
}

// Start runs the gRPC server on the specified port.
func (s *Server) Start(port string) error {
	addr := fmt.Sprintf(":%s", port)
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to listen: %w", err)
	}

	fmt.Printf("gRPC server listening on %s\n", addr)
	
	// Graceful shutdown handling.
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		fmt.Println("Shutting down gRPC server...")
		s.grpcServer.GracefulStop()
	}()

	if err := s.grpcServer.Serve(lis); err != nil {
		return fmt.Errorf("failed to serve: %w", err)
	}

	return nil
}
