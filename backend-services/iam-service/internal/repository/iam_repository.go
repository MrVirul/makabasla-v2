package repository

import (
	"errors"
)

type IamRepository interface {
	GetUser(username string) (string, error)
}

type iamRepository struct {
	// Add DB connection here
}

func NewIamRepository() IamRepository {
	return &iamRepository{}
}

func (r *iamRepository) GetUser(username string) (string, error) {
	// Mock implementation
	if username == "" {
		return "", errors.New("username cannot be empty")
	}
	return "mock_user", nil
}
