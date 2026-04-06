package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/iam-service/internal/models"
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

func (h *IamHandler) SyncProfile(c echo.Context) error {
	type Request struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
		Phone string `json:"phone"`
		Role  string `json:"role"`
		Image string `json:"image"`
	}

	var req Request
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	profile, err := h.srv.SyncProfile(req.ID, req.Email, req.Name, req.Phone, req.Role, req.Image)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, profile)
}

func (h *IamHandler) GetProfile(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "id path parameter is required")
	}

	profile, err := h.srv.GetProfile(id)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "profile not found")
	}

	return c.JSON(http.StatusOK, profile)
}

func (h *IamHandler) CreateVehicle(c echo.Context) error {
	var v models.Vehicle
	if err := c.Bind(&v); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.srv.AddVehicle(&v); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, v)
}

func (h *IamHandler) GetAllVehicles(c echo.Context) error {
	vehicles, err := h.srv.GetAllVehicles()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, vehicles)
}

func (h *IamHandler) GetAllCustomers(c echo.Context) error {
	customers, err := h.srv.GetAllCustomers()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, customers)
}

func (h *IamHandler) Login(c echo.Context) error {
	type LoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.srv.LoginAdmin(req.Username, req.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	return c.JSON(http.StatusOK, user)
}

func (h *IamHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/api/v1/user", h.GetUser)
	e.POST("/api/v1/profile", h.SyncProfile)
	e.GET("/api/v1/profile/:id", h.GetProfile)
	e.POST("/api/v1/vehicle", h.CreateVehicle)
	e.GET("/api/v1/vehicles", h.GetAllVehicles)
	e.GET("/api/v1/customers", h.GetAllCustomers)
	e.POST("/api/v1/auth/login", h.Login)
}
