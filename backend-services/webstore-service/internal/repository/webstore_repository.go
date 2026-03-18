package repository

import (
	"gorm.io/gorm"
)

type WebstoreRepository interface {
	GetData() (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewWebstoreRepository(db *gorm.DB) WebstoreRepository {
	return &repository{db: db}
}

func (r *repository) GetData() (string, error) {
	return "webstore data", nil
}
