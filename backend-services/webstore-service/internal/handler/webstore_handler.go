package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/webstore-service/internal/service"
)

type WebstoreHandler struct {
	srv service.WebstoreService
}

func NewWebstoreHandler(srv service.WebstoreService) *WebstoreHandler {
	return &WebstoreHandler{
		srv: srv,
	}
}

func (h *WebstoreHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "UP",
	})
}

func (h *WebstoreHandler) GetData(c echo.Context) error {
	info, err := h.srv.ProcessData()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"info": info,
	})
}

func (h *WebstoreHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/actuator/health", h.HealthCheck)
	e.GET("/api/v1/webstore", h.GetData)
}
