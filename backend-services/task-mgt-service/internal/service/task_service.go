package service

import (
	"fmt"
	"github.com/makabas/task-mgt-service/internal/database"
	"github.com/makabas/task-mgt-service/internal/repository"
)

type TaskService interface {
	CreateTask(vehicleID uint, description string) (*database.Task, error)
	GetTasksByVehicleID(vehicleID uint) ([]database.Task, error)
	UpdateTaskStatus(taskID uint, status string) (*database.Task, error)
}

type service struct {
	repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return &service{
		repo: repo,
	}
}

func (s *service) CreateTask(vehicleID uint, description string) (*database.Task, error) {
	task := &database.Task{
		VehicleID:   vehicleID,
		Description: description,
		Status:      "pending",
		TaskNumber:  fmt.Sprintf("TSK-%d-%d", vehicleID, 1),
	}
	
	tasks, err := s.repo.GetTasksByVehicleID(vehicleID)
	if err == nil {
		task.TaskNumber = fmt.Sprintf("TSK-%d-%d", vehicleID, len(tasks)+1)
	}

	err = s.repo.CreateTask(task)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}
	return task, nil
}

func (s *service) GetTasksByVehicleID(vehicleID uint) ([]database.Task, error) {
	return s.repo.GetTasksByVehicleID(vehicleID)
}

func (s *service) UpdateTaskStatus(taskID uint, status string) (*database.Task, error) {
	task, err := s.repo.GetTaskByID(taskID)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}
	task.Status = status
	err = s.repo.UpdateTask(task)
	if err != nil {
		return nil, fmt.Errorf("failed to update task status: %w", err)
	}
	return task, nil
}
