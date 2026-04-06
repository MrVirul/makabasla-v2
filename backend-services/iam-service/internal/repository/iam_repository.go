package repository

import (
	"errors"

	"github.com/makabas/iam-service/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IamRepository interface {
	GetUser(username string) (string, error)
	SyncCustomer(id string, email string, name string, phone string, image string) (*models.Customer, error)
	GetCustomer(id string) (*models.Customer, error)
	SyncAdmin(id string, email string, name string, phone string, image string) (*models.Admin, error)
	SyncTechnician(id string, email string, name string, phone string, image string) (*models.Technician, error)
	SyncStaff(id string, email string, name string, role string, phone string, image string) (*models.Staff, error)
	CreateVehicle(vehicle *models.Vehicle) error
	GetVehicles(customerID string) ([]models.Vehicle, error)
	GetAllVehicles() ([]models.Vehicle, error)
	GetAllCustomers() ([]models.Customer, error)
	LoginAdmin(username string, password string) (*models.Admin, error)
}

type iamRepository struct {
	db *gorm.DB
}

// nullablePhone returns nil if phone is empty, otherwise returns a pointer to the value.
// This prevents empty-string uniqueness conflicts when phone is not provided.
func nullablePhone(phone string) *string {
	if phone == "" {
		return nil
	}
	return &phone
}

func (r *iamRepository) SyncCustomer(id string, email string, name string, phone string, image string) (*models.Customer, error) {
	customer := &models.Customer{
		ID:       id,
		Email:    email,
		Name:     name,
		Phone:    nullablePhone(phone),
		ImageURL: image,
	}
	updateCols := []string{"email", "name"}
	if image != "" {
		updateCols = append(updateCols, "image_url")
	}
	if phone != "" {
		updateCols = append(updateCols, "phone")
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns(updateCols),
	}).Create(customer).Error
	if err != nil {
		return nil, err
	}

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

func (r *iamRepository) SyncAdmin(id string, email string, name string, phone string, image string) (*models.Admin, error) {
	admin := &models.Admin{
		ID:       id,
		Email:    email,
		Name:     name,
		Phone:    nullablePhone(phone),
		ImageURL: image,
	}
	updateCols := []string{"email", "name"}
	if image != "" {
		updateCols = append(updateCols, "image_url")
	}
	if phone != "" {
		updateCols = append(updateCols, "phone")
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns(updateCols),
	}).Create(admin).Error
	return admin, err
}

func (r *iamRepository) SyncTechnician(id string, email string, name string, phone string, image string) (*models.Technician, error) {
	tech := &models.Technician{
		ID:       id,
		Email:    email,
		Name:     name,
		Phone:    nullablePhone(phone),
		ImageURL: image,
	}
	updateCols := []string{"email", "name"}
	if image != "" {
		updateCols = append(updateCols, "image_url")
	}
	if phone != "" {
		updateCols = append(updateCols, "phone")
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns(updateCols),
	}).Create(tech).Error
	return tech, err
}

func (r *iamRepository) SyncStaff(id string, email string, name string, role string, phone string, image string) (*models.Staff, error) {
	staff := &models.Staff{
		ID:       id,
		Email:    email,
		Name:     name,
		Role:     role,
		Phone:    nullablePhone(phone),
		ImageURL: image,
	}
	updateCols := []string{"email", "name", "role"}
	if image != "" {
		updateCols = append(updateCols, "image_url")
	}
	if phone != "" {
		updateCols = append(updateCols, "phone")
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns(updateCols),
	}).Create(staff).Error
	return staff, err
}

func (r *iamRepository) CreateVehicle(vehicle *models.Vehicle) error {
	return r.db.Create(vehicle).Error
}

func (r *iamRepository) GetVehicles(customerID string) ([]models.Vehicle, error) {
	var vehicles []models.Vehicle
	err := r.db.Find(&vehicles, "customer_id = ?", customerID).Error
	return vehicles, err
}

func (r *iamRepository) GetAllVehicles() ([]models.Vehicle, error) {
	var vehicles []models.Vehicle
	err := r.db.Preload("Customer").Find(&vehicles).Error
	return vehicles, err
}

func (r *iamRepository) GetAllCustomers() ([]models.Customer, error) {
	var customers []models.Customer
	err := r.db.Preload("Vehicles").Find(&customers).Error
	return customers, err
}

func NewIamRepository(db *gorm.DB) IamRepository {
	return &iamRepository{db: db}
}

func (r *iamRepository) GetUser(username string) (string, error) {
	if username == "" {
		return "", errors.New("username cannot be empty")
	}
	return "mock_user", nil
}

func (r *iamRepository) LoginAdmin(username string, password string) (*models.Admin, error) {
	var admin models.Admin
	if err := r.db.Where("username = ?", username).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}
