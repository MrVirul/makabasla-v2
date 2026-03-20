package repository

import (
	"errors"

	"gorm.io/gorm"
)

type IamRepository interface {
	GetUser(username string) (string, error)
}

type iamRepository struct {
	db *gorm.DB
}

func NewIamRepository(db *gorm.DB) IamRepository {
	return &iamRepository{db: db}
}

func (r *iamRepository) GetUser(username string) (string, error) {
	// Mock implementation
	if username == "" {
		return "", errors.New("username cannot be empty")
	}
	return "mock_user", nil
}
