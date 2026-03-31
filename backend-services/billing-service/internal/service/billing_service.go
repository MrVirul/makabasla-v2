package service

import (
	"github.com/makabas/billing-service/internal/models"
	"github.com/makabas/billing-service/internal/repository"
)

type BillingService interface {
	CreateBilling(billing *models.Billing) error
}

type service struct {
	repo repository.BillingRepository
}

func NewBillingService(repo repository.BillingRepository) BillingService {
	return &service{
		repo: repo,
	}
}

// CreateBilling creates a new billing record
func (s *service) CreateBilling(billing *models.Billing) error {
	return s.repo.CreateBilling(billing)

}
