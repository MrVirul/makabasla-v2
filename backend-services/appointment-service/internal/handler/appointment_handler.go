package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/appointment-service/internal/service"
)

type AppointmentHandler struct {
	srv service.AppointmentService
}

func NewAppointmentHandler(srv service.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{
		srv: srv,
	}
}

func (h *AppointmentHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "UP",
	})
}

func (h *AppointmentHandler) GetData(c echo.Context) error {
	info, err := h.srv.ProcessData()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"info": info,
	})
}

func (h *AppointmentHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/actuator/health", h.HealthCheck)
	e.GET("/api/v1/appointment", h.GetData)
}
