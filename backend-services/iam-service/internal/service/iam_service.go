package service

import (
	"fmt"

	"github.com/makabas/iam-service/internal/models"
	"github.com/makabas/iam-service/internal/repository"
)

type IamService interface {
	GetUserInfo(username string) (string, error)
	SyncProfile(id, email, name, phone, role string) (interface{}, error)
	GetProfile(id string) (interface{}, error)
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

func (s *iamService) SyncProfile(id, email, name, phone, role string) (interface{}, error) {
	switch role {
	case "ADMIN":
		return s.repo.SyncAdmin(id, email, name, phone)
	case "TECHNICIAN":
		return s.repo.SyncTechnician(id, email, name, phone)
	case "STAFF":
		return s.repo.SyncStaff(id, email, name, "General Staff", phone)
	default:
		return s.repo.SyncCustomer(id, email, name, phone)
	}
}

func (s *iamService) GetProfile(id string) (interface{}, error) {

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
