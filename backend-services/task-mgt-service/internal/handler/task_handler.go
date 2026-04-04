package handler

import (
	"net/http"
	"strconv"

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

type CreateTaskRequest struct {
	Description string `json:"description"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

func (h *TaskHandler) CreateTask(c echo.Context) error {
	vehicleIDStr := c.Param("vehicle_id")
	vehicleID, err := strconv.ParseUint(vehicleIDStr, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid vehicle id")
	}

	var req CreateTaskRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	task, err := h.srv.CreateTask(uint(vehicleID), req.Description)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, task)
}

func (h *TaskHandler) GetTasks(c echo.Context) error {
	vehicleIDStr := c.Param("vehicle_id")
	vehicleID, err := strconv.ParseUint(vehicleIDStr, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid vehicle id")
	}

	tasks, err := h.srv.GetTasksByVehicleID(uint(vehicleID))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) UpdateTaskStatus(c echo.Context) error {
	taskIDStr := c.Param("task_id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid task id")
	}

	var req UpdateStatusRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	task, err := h.srv.UpdateTaskStatus(uint(taskID), req.Status)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) RegisterRoutes(e *echo.Echo) {
	api := e.Group("/api/v1")
	api.POST("/vehicles/:vehicle_id/tasks", h.CreateTask)
	api.GET("/vehicles/:vehicle_id/tasks", h.GetTasks)
	api.PATCH("/tasks/:task_id/status", h.UpdateTaskStatus)
}

