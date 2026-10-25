package proxy

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/makabas/shared/pkg/discovery"
)

// Route describes how a gateway path prefix maps onto a backend service.
//
// The gateway exposes a service under its own prefix (for example /api/task)
// while the service itself serves its routes under a fixed base (for example
// /api/v1). Both the short form and the fully qualified form are accepted:
//
//	/api/task/vehicles/1/tasks          -> /api/v1/vehicles/1/tasks
//	/api/task/api/v1/vehicles/1/tasks   -> /api/v1/vehicles/1/tasks
type Route struct {
	// Service is the name the backend registers under in Consul.
	Service string
	// Prefix is the gateway-side path prefix, for example "/api/task".
	Prefix string
	// APIBase is the path base the service serves its routes under,
	// for example "/api/v1".
	APIBase string
	// RootPath is forwarded when the request path is exactly the prefix.
	// It is optional; when empty the APIBase is used.
	RootPath string
}

// Rewrite maps an incoming gateway path onto the path the service expects.
func (r Route) Rewrite(path string) string {
	remainder := strings.TrimPrefix(path, r.Prefix)

	switch {
	case remainder == "" || remainder == "/":
		if r.RootPath != "" {
			return r.RootPath
		}
		return r.APIBase
	case hasBase(remainder, r.APIBase):
		// Already fully qualified, forward it untouched.
		return remainder
	default:
		return r.APIBase + remainder
	}
}

// hasBase reports whether a path already sits under the given base.
func hasBase(path, base string) bool {
	return path == base || strings.HasPrefix(path, base+"/")
}

type targetKey struct{}

// Handler builds a reverse proxy that forwards requests to the service
// registered in Consul, falling back to the resolver's static address when
// Consul has no healthy instance.
func Handler(resolver *discovery.Resolver, route Route) echo.HandlerFunc {
	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			target, _ := pr.Out.Context().Value(targetKey{}).(*url.URL)
			if target != nil {
				pr.Out.URL.Scheme = target.Scheme
				pr.Out.URL.Host = target.Host
				pr.Out.Host = target.Host
			}
			pr.SetXForwarded()
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("Proxy error for %s: %v", route.Service, err)
			w.Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			w.WriteHeader(http.StatusBadGateway)
			_, _ = w.Write([]byte(`{"message":"upstream service unavailable"}`))
		},
	}

	return func(c echo.Context) error {
		req := c.Request()
		res := c.Response()

		resolved, err := resolver.Resolve(route.Service)
		if err != nil {
			log.Printf("Failed to resolve %s: %v", route.Service, err)
			return echo.NewHTTPError(http.StatusServiceUnavailable, "service unavailable")
		}

		target := &url.URL{Scheme: "http", Host: resolved.HostPort()}

		req.URL.Path = route.Rewrite(req.URL.Path)
		if req.URL.RawPath != "" {
			req.URL.RawPath = route.Rewrite(req.URL.RawPath)
		}
		req.RequestURI = ""

		ctx := context.WithValue(req.Context(), targetKey{}, target)
		proxy.ServeHTTP(res, req.WithContext(ctx))
		return nil
	}
}
