package handler

import (
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



func (h *BillingHandler) RegisterRoutes(e *echo.Echo) {
}
