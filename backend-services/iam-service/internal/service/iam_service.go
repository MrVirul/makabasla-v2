package service

import (
	"fmt"
	"github.com/makabas/iam-service/internal/models"
	"github.com/makabas/iam-service/internal/repository"
)

type IamService interface {
	GetUserInfo(username string) (string, error)
	SyncProfile(id, email, name, phone string) (*models.Customer, error)
	GetProfile(id string) (*models.Customer, error)
	AddVehicle(vehicle *models.Vehicle) error
	GetVehicles(customerID string) ([]models.Vehicle, error)
}

type iamService struct {
	repo repository.IamRepository
}

func NewIamService(repo repository.IamRepository) IamService {
	return &iamService{
		repo: repo,
	}
}

func (s *iamService) SyncProfile(id, email, name, phone string) (*models.Customer, error) {
	return s.repo.SyncCustomer(id, email, name, phone)
}

func (s *iamService) GetProfile(id string) (*models.Customer, error) {
	return s.repo.GetCustomer(id)
}

func (s *iamService) AddVehicle(vehicle *models.Vehicle) error {
	return s.repo.CreateVehicle(vehicle)
}

func (s *iamService) GetVehicles(customerID string) ([]models.Vehicle, error) {
	return s.repo.GetVehicles(customerID)
}

func (s *iamService) GetUserInfo(username string) (string, error) {
	user, err := s.repo.GetUser(username)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve user: %w", err)
	}

	return fmt.Sprintf("User info for: %s", user), nil
}
