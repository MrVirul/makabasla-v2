package repository

import (
	"gorm.io/gorm"
)

type BillingRepository interface {
}

type repository struct {
	db *gorm.DB
}

func NewBillingRepository(db *gorm.DB) BillingRepository {
	return &repository{db: db}
}
