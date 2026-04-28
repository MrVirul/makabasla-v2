package service

import (
	"fmt"
	"time"

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
	LoginCustomer(email, password string) (interface{}, error)
	RegisterCustomer(email, password, name, phone string) (interface{}, error)
	UpdateVehicle(vehicle *models.Vehicle) error
	DeleteVehicle(id uint) error
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

	// For dev phase, if password matches or is 'admin' bypass
	if admin.Password != "" && admin.Password != password {
		if password != "admin" { // Dev bypass
			return nil, fmt.Errorf("invalid credentials")
		}
	}
	
	return map[string]interface{}{
		"id":    admin.ID,
		"name":  admin.Name,
		"email": admin.Email,
		"image": admin.ImageURL,
		"roles": []string{"admin", "super_admin"},
	}, nil
}

func (s *iamService) LoginCustomer(email, password string) (interface{}, error) {
	customer, err := s.repo.LoginCustomer(email, password)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// For now, if customer has a password, we verify it.
	// If they don't have a password (e.g. Google-only), we might need to handle that.
	if customer.Password != "" && customer.Password != password {
		return nil, fmt.Errorf("invalid credentials")
	}

	return map[string]interface{}{
		"id":    customer.ID,
		"name":  customer.Name,
		"email": customer.Email,
		"image": customer.ImageURL, "roles": []string{"customer"},
	}, nil
}

func (s *iamService) RegisterCustomer(email, password, name, phone string) (interface{}, error) {
	// 1. Validate Phone Number (must be 10 digits)
	if len(phone) != 10 {
		return nil, fmt.Errorf("phone number must contain exactly 10 digits")
	}
	for _, char := range phone {
		if char < '0' || char > '9' {
			return nil, fmt.Errorf("phone number must contain only numbers")
		}
	}

	// 2. Check for existing email (and potential Google OAuth link)
	existingEmail, err := s.repo.GetCustomerByEmail(email)
	if err == nil && existingEmail != nil {
		if existingEmail.Password == "" {
			return nil, fmt.Errorf("this email is already registered via Google. Please sign in with Google")
		}
		return nil, fmt.Errorf("an account with this email already exists")
	}

	// 3. Check for existing phone number
	existingPhone, err := s.repo.GetCustomerByPhone(phone)
	if err == nil && existingPhone != nil {
		return nil, fmt.Errorf("this phone number is already registered")
	}

	// Simple ID generation for dev
	id := fmt.Sprintf("cust_%d", time.Now().UnixNano())

	customer := &models.Customer{
		ID:       id,
		Email:    email,
		Password: password,
		Name:     name,
		Phone:    &phone,
	}

	if err := s.repo.CreateCustomer(customer); err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	return map[string]interface{}{
		"id":    customer.ID,
		"name":  customer.Name,
		"email": customer.Email,
		"image": customer.ImageURL, "roles": []string{"customer"},
	}, nil
}

func (s *iamService) UpdateVehicle(vehicle *models.Vehicle) error {
	return s.repo.UpdateVehicle(vehicle)
}

func (s *iamService) DeleteVehicle(id uint) error {
	return s.repo.DeleteVehicle(id)
}
