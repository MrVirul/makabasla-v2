package httpclient

import (
	"context"
	"net/http"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/labstack/echo/v4"
)

const (
	AuthContextKey = "authorization_token"
	DefaultRetryCount = 3
	DefaultRetryWaitTime = 100 * time.Millisecond
	DefaultMaxRetryWaitTime = 2 * time.Second
)

// InternalClient defines a standard HTTP client for inter-service communication.
type InternalClient interface {
	GetClient() *resty.Client
	PropagateToken(ctx context.Context, req *resty.Request)
}

type internalClient struct {
	client *resty.Client
}

// NewInternalClient creates a new resty client with retry and token propagation.
func NewInternalClient() InternalClient {
	client := resty.New().
		SetRetryCount(DefaultRetryCount).
		SetRetryWaitTime(DefaultRetryWaitTime).
		SetRetryMaxWaitTime(DefaultMaxRetryWaitTime).
		AddRetryCondition(
			func(r *resty.Response, err error) bool {
				return err != nil || r.StatusCode() >= http.StatusInternalServerError
			},
		)

	// Add an OnBeforeRequest middleware to handle token propagation.
	client.OnBeforeRequest(func(c *resty.Client, r *resty.Request) error {
		// Attempt to get token from context.
		if token, ok := r.Context().Value(AuthContextKey).(string); ok && token != "" {
			r.SetHeader(echo.HeaderAuthorization, token)
		}
		return nil
	})

	return &internalClient{
		client: client,
	}
}

func (ic *internalClient) GetClient() *resty.Client {
	return ic.client
}

func (ic *internalClient) PropagateToken(ctx context.Context, req *resty.Request) {
    if token, ok := ctx.Value(AuthContextKey).(string); ok && token != "" {
        req.SetHeader(echo.HeaderAuthorization, token)
    }
}

// ExtractTokenMiddleware is an Echo middleware that extracts the Authorization header
// and puts it into the context for later propagation by the internal client.
func ExtractTokenMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get(echo.HeaderAuthorization)
			if authHeader != "" {
				// We attach it to the request context.
				ctx := context.WithValue(c.Request().Context(), AuthContextKey, authHeader)
				c.SetRequest(c.Request().WithContext(ctx))
			}
			return next(c)
		}
	}
}

// RequestContext returns a context with the Authorization token if present in the Echo context.
func RequestContext(c echo.Context) context.Context {
	return c.Request().Context()
}

// NewRequestWithContext is a helper to start a request that will propagate tokens from the context.
func (ic *internalClient) NewRequestWithContext(ctx context.Context) *resty.Request {
	return ic.client.R().SetContext(ctx)
}
