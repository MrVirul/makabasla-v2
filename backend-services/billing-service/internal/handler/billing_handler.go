package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/billing-service/internal/service"
)

type BillingHandler struct {
	srv service.BillingService
}

func NewBillingHandler(srv service.BillingService) *BillingHandler {
	return &BillingHandler{
		srv: srv,
	}
}

func (h *BillingHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "UP",
	})
}

func (h *BillingHandler) GetData(c echo.Context) error {
	info, err := h.srv.ProcessData()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"info": info,
	})
}

func (h *BillingHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/actuator/health", h.HealthCheck)
	e.GET("/api/v1/billing", h.GetData)
}
