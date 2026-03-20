package grpc

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

const (
	AuthMetadataKey = "authorization"
)

// Client defines a standard gRPC client wrapper.
type Client struct {
	conn *grpc.ClientConn
}

// NewClient establishes a standard gRPC connection.
func NewClient(target string) (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient(
		target,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		// Add standard interceptors for retry, metadata, etc.
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create client connection: %w", err)
	}
	return conn, nil
}

// PropagateTokenInterceptor propagates the Authorization token from the local context
// (e.g., from an incoming HTTP request) to the gRPC call metadata.
func PropagateTokenInterceptor() grpc.UnaryClientInterceptor {
	return func(
		ctx context.Context,
		method string,
		req, reply interface{},
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption,
	) error {
		// Extract token from context (using the same key as HTTP client for consistency).
		// We should adapt it to gRPC's expectation.
		// If using shared httpclient's AuthContextKey, extract it here.
		if token, ok := ctx.Value("authorization_token").(string); ok && token != "" {
			md := metadata.Pairs(AuthMetadataKey, token)
			ctx = metadata.NewOutgoingContext(ctx, md)
		}

		return invoker(ctx, method, req, reply, cc, opts...)
	}
}

// StreamPropagateTokenInterceptor provides similar logic for streaming gRPC calls.
func StreamPropagateTokenInterceptor() grpc.StreamClientInterceptor {
	return func(
		ctx context.Context,
		desc *grpc.StreamDesc,
		cc *grpc.ClientConn,
		method string,
		streamer grpc.Streamer,
		opts ...grpc.CallOption,
	) (grpc.ClientStream, error) {
		if token, ok := ctx.Value("authorization_token").(string); ok && token != "" {
			md := metadata.Pairs(AuthMetadataKey, token)
			ctx = metadata.NewOutgoingContext(ctx, md)
		}
		return streamer(ctx, desc, cc, method, opts...)
	}
}
