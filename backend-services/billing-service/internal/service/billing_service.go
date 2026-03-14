package service

import (
	"fmt"
	"github.com/makabas/billing-service/internal/repository"
)

type BillingService interface {
	ProcessData() (string, error)
}

type service struct {
	repo repository.BillingRepository
}

func NewBillingService(repo repository.BillingRepository) BillingService {
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
