package middleware

import (
	"context"
	"strings"
	"github.com/Nerzal/gocloak/v13"
	"github.com/labstack/echo/v4"
	"net/http"
)

func KeycloakAuthMiddleware(client *gocloak.GoCloak, realm, clientID, clientSecret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip JWT auth for health and auth endpoints
			if c.Path() == "/actuator/health" || strings.HasPrefix(c.Path(), "/api/auth/") || strings.HasPrefix(c.Path(), "/keycloak") {
				return next(c)
			}

			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing token")
			}

			accessToken := strings.Replace(authHeader, "Bearer ", "", 1)
			
			// 1. Validate the token with Keycloak
			rptResult, err := client.RetrospectToken(context.Background(), accessToken, clientID, clientSecret, realm)
			if err != nil || !*rptResult.Active {
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
			}

			// 2. Optional: Check for Roles (e.g., Admin only)
			// You can parse the JWT claims here to see if the user has the 'admin' role
			
			return next(c)
		}
	}
}
