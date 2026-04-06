package service

import (
	"fmt"

	"github.com/makabas/iam-service/internal/models"
	"github.com/makabas/iam-service/internal/repository"
	// "golang.org/x/crypto/bcrypt"
)

type IamService interface {
	GetUserInfo(username string) (string, error)
	SyncProfile(id, email, name, phone, role, image string) (interface{}, error)
	GetProfile(id string) (interface{}, error)
	AddVehicle(vehicle *models.Vehicle) error
	GetVehicles(customerID string) ([]models.Vehicle, error)
	GetAllVehicles() ([]models.Vehicle, error)
	GetAllCustomers() ([]models.Customer, error)
	LoginAdmin(username, password string) (interface{}, error)
}

type iamService struct {
	repo repository.IamRepository
}

func NewIamService(repo repository.IamRepository) IamService {
	return &iamService{
		repo: repo,
	}
}

func (s *iamService) SyncProfile(id, email, name, phone, role, image string) (interface{}, error) {
	switch role {
	case "ADMIN":
		return s.repo.SyncAdmin(id, email, name, phone, image)
	case "TECHNICIAN":
		return s.repo.SyncTechnician(id, email, name, phone, image)
	case "STAFF":
		return s.repo.SyncStaff(id, email, name, "General Staff", phone, image)
	default:
		return s.repo.SyncCustomer(id, email, name, phone, image)
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

func (s *iamService) GetAllVehicles() ([]models.Vehicle, error) {
	return s.repo.GetAllVehicles()
}

func (s *iamService) GetAllCustomers() ([]models.Customer, error) {
	return s.repo.GetAllCustomers()
}

func (s *iamService) GetUserInfo(username string) (string, error) {
	user, err := s.repo.GetUser(username)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve user: %w", err)
	}

	return fmt.Sprintf("User info for: %s", user), nil
}

func (s *iamService) LoginAdmin(username, password string) (interface{}, error) {
	admin, err := s.repo.LoginAdmin(username, password)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// In a real app, you would compare Bcrypt hashes:
	// err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password))
	// if err != nil { return nil, errors.New("invalid credentials") }

	// For the migration phase, if password is set we verify it.
	// We'll trust our development bypass for now.
	
	return map[string]interface{}{
		"id":    admin.ID,
		"name":  admin.Name,
		"email": admin.Email,
		"roles": []string{"admin", "super_admin"}, // Simplified for now
	}, nil
}
