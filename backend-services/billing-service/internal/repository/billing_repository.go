package repository

import (
	"github.com/makabas/billing-service/internal/models"
	"gorm.io/gorm"
)

type BillingRepository interface {
	CreateBilling(billing *models.Billing) error
}

type repository struct {
	db *gorm.DB
}

func NewBillingRepository(db *gorm.DB) BillingRepository {
	return &repository{db: db}
}

// CreateBilling creates a new billing record
func (r *repository) CreateBilling(billing *models.Billing) error {
	return r.db.Create(billing).Error
}
