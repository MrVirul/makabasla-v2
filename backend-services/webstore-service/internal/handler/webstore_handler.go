package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/makabas/webstore-service/internal/models"
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

func (h *WebstoreHandler) GetAllProducts(c echo.Context) error {
	searchQuery := c.QueryParam("search")
	var products []models.Product
	var err error

	if searchQuery != "" {
		products, err = h.srv.SearchProducts(searchQuery)
	} else {
		products, err = h.srv.GetAllProducts()
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, products)
}

func (h *WebstoreHandler) CreateProduct(c echo.Context) error {
	var p models.Product
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := h.srv.CreateProduct(&p); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, p)
}

func (h *WebstoreHandler) UpdateProduct(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	var p models.Product
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	p.ID = uint(id)

	if err := h.srv.UpdateProduct(&p); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, p)
}

func (h *WebstoreHandler) DeleteProduct(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	if err := h.srv.DeleteProduct(uint(id)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *WebstoreHandler) BuyProduct(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id")
	}

	// For simplicity, default quantity to 1. Could also parse from body.
	if err := h.srv.BuyProduct(uint(id), 1); err != nil {
		if err.Error() == "insufficient stock" {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "purchase successful"})
}

func (h *WebstoreHandler) GetAnalytics(c echo.Context) error {
	analytics, err := h.srv.GetAnalytics()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, analytics)
}

func (h *WebstoreHandler) RegisterRoutes(e *echo.Echo) {
	group := e.Group("/api/v1/webstore/products")
	group.GET("", h.GetAllProducts)
	group.POST("", h.CreateProduct)
	group.PUT("/:id", h.UpdateProduct)
	group.DELETE("/:id", h.DeleteProduct)
	group.POST("/:id/buy", h.BuyProduct)

	analyticsGroup := e.Group("/api/v1/webstore/analytics")
	analyticsGroup.GET("", h.GetAnalytics)
}
