package repository

import (
	"errors"

	"github.com/makabas/iam-service/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IamRepository interface {
	GetUser(username string) (string, error)
	SyncCustomer(id string, email string, name string, phone string) (*models.Customer, error)
	GetCustomer(id string) (*models.Customer, error)
	CreateVehicle(vehicle *models.Vehicle) error
	GetVehicles(customerID string) ([]models.Vehicle, error)
}

type iamRepository struct {
	db *gorm.DB
}

func (r *iamRepository) SyncCustomer(id string, email string, name string, phone string) (*models.Customer, error) {
	customer := &models.Customer{
		ID:    id,
		Email: email,
		Name:  name,
		Phone: phone,
	}
	// This uses GORM's "Clauses" to handle:
	// IF NOT EXISTS: Insert | IF EXISTS: Do nothing (or Update)
	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"email", "name", "phone"}), // Update if info changed
	}).Create(customer).Error
	if err != nil {
		return nil, err
	}

	// Fetch full profile with preloaded vehicles after sync
	return r.GetCustomer(id)
}

func (r *iamRepository) GetCustomer(id string) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.Preload("Vehicles").First(&customer, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *iamRepository) CreateVehicle(vehicle *models.Vehicle) error {
	return r.db.Create(vehicle).Error
}

func (r *iamRepository) GetVehicles(customerID string) ([]models.Vehicle, error) {
	var vehicles []models.Vehicle
	err := r.db.Find(&vehicles, "customer_id = ?", customerID).Error
	return vehicles, err
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
