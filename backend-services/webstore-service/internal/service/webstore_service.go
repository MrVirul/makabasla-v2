package service

import (
	"fmt"
	"github.com/makabas/webstore-service/internal/repository"
)

type WebstoreService interface {
	ProcessData() (string, error)
}

type service struct {
	repo repository.WebstoreRepository
}

func NewWebstoreService(repo repository.WebstoreRepository) WebstoreService {
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
