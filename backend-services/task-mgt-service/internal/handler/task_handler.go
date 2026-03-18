package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/makabas/task-mgt-service/internal/service"
)

type TaskHandler struct {
	srv service.TaskService
}

func NewTaskHandler(srv service.TaskService) *TaskHandler {
	return &TaskHandler{
		srv: srv,
	}
}

func (h *TaskHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "UP",
	})
}

func (h *TaskHandler) GetData(c echo.Context) error {
	info, err := h.srv.ProcessData()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"info": info,
	})
}

func (h *TaskHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/health", h.HealthCheck)
	e.GET("/api/v1/task", h.GetData)
}
