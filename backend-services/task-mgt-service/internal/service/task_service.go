package service

import (
	"fmt"
	"github.com/makabas/task-mgt-service/internal/repository"
)

type TaskService interface {
	ProcessData() (string, error)
}

type service struct {
	repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return &service{
		repo: repo,
	}
}

func (s *service) ProcessData() (string, error) {
	data, err := s.repo.GetData()
	if err != nil {
		return "", fmt.Errorf("failed: %w", err)
	}
	return fmt.Sprintf("Processed: %s", data), nil
}
