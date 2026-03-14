package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/iam-service/internal/service"
)

type IamHandler struct {
	srv service.IamService
}

func NewIamHandler(srv service.IamService) *IamHandler {
	return &IamHandler{
		srv: srv,
	}
}

func (h *IamHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "UP",
	})
}

func (h *IamHandler) GetUser(c echo.Context) error {
	username := c.QueryParam("username")
	if username == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "username query parameter is required")
	}

	info, err := h.srv.GetUserInfo(username)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"info": info,
	})
}

func (h *IamHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/actuator/health", h.HealthCheck)
	e.GET("/api/v1/user", h.GetUser)
}
