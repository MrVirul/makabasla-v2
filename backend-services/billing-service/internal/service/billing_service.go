package service

import (
	"github.com/makabas/billing-service/internal/repository"
)

type BillingService interface {
}

type service struct {
	repo repository.BillingRepository
}

func NewBillingService(repo repository.BillingRepository) BillingService {
	return &service{
		repo: repo,
	}
}
