package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func KeycloakAuthMiddleware(client *gocloak.GoCloak, realm, clientID, clientSecret, iamServiceURL string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip JWT auth for health and auth endpoints
			if c.Path() == "/health" || strings.HasPrefix(c.Path(), "/api/auth/") || strings.HasPrefix(c.Path(), "/keycloak") {
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

			// 2. Extract info and Sync with IAM Service
			go syncWithIAM(accessToken, iamServiceURL)

			return next(c)
		}
	}
}

func syncWithIAM(tokenString string, iamServiceURL string) {
	// 1. Parse token to get claims (already validated by gateway)
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return
	}

	// 2. Extract relevant info
	id, _ := claims["sub"].(string)
	email, _ := claims["email"].(string)
	name, _ := claims["name"].(string)
	
	// Determine Role: check realm_access or custom roles
	role := "CUSTOMER" // Default
	if realmAccess, ok := claims["realm_access"].(map[string]interface{}); ok {
		if roles, ok := realmAccess["roles"].([]interface{}); ok {
			for _, r := range roles {
				roleStr := strings.ToUpper(fmt.Sprint(r))
				if roleStr == "ADMIN" || roleStr == "TECHNICIAN" || roleStr == "STAFF" {
					role = roleStr
					break
				}
			}
		}
	}

	// 3. Send to IAM Service
	syncData := map[string]string{
		"id":    id,
		"email": email,
		"name":  name,
		"role":  role,
	}

	jsonData, _ := json.Marshal(syncData)
	resp, err := http.Post(iamServiceURL+"/api/v1/profile", "application/json", bytes.NewBuffer(jsonData))
	if err == nil {
		resp.Body.Close()
	}
}
