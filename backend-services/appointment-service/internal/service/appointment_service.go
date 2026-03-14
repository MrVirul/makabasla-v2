package service

import (
	"fmt"
	"github.com/makabas/appointment-service/internal/repository"
)

type AppointmentService interface {
	ProcessData() (string, error)
}

type service struct {
	repo repository.AppointmentRepository
}

func NewAppointmentService(repo repository.AppointmentRepository) AppointmentService {
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
