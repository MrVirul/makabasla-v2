package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func JwtAuthMiddleware(secret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip JWT auth for health endpoint
			if c.Path() == "/health" || strings.HasPrefix(c.Path(), "/api/auth/login") {
				return next(c)
			}

			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing or invalid authorization header")
			}

			tokenStr := authHeader[7:]
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized: "+err.Error())
			}

			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if subject, ok := claims["sub"].(string); ok {
					c.Request().Header.Set("X-User-Id", subject)
				}
				if email, ok := claims["email"].(string); ok {
					c.Request().Header.Set("X-User-Email", email)
				}
			}

			return next(c)
		}
	}
}
