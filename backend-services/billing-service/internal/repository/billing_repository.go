package repository

import (
	"gorm.io/gorm"
)

type BillingRepository interface {
	GetData() (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewBillingRepository(db *gorm.DB) BillingRepository {
	return &repository{db: db}
}

func (r *repository) GetData() (string, error) {
	return "billing data", nil
}
