package repository

import (
	"github.com/makabas/billing-service/internal/models"
	"gorm.io/gorm"
)

type BillingRepository interface {
	GetBillingByVehicleID(vehicleID uint) (*models.Billing, error)
	CreateBilling(billing *models.Billing) error
	UpdateBilling(billing *models.Billing) error
	AddExpense(expense *models.Expense) error
	AddAdvance(advance *models.Advance) error
	GetAllBillings() ([]models.Billing, error)
	DeleteBillingByVehicleID(vehicleID uint) error
}

type repository struct {
	db *gorm.DB
}

func NewBillingRepository(db *gorm.DB) BillingRepository {
	return &repository{db: db}
}

func (r *repository) GetBillingByVehicleID(vehicleID uint) (*models.Billing, error) {
	var billing models.Billing
	result := r.db.Preload("Expenses").Preload("Advances").Where("vehicle_id = ?", vehicleID).Limit(1).Find(&billing)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, nil
	}
	return &billing, nil
}

func (r *repository) CreateBilling(billing *models.Billing) error {
	return r.db.Create(billing).Error
}

func (r *repository) UpdateBilling(billing *models.Billing) error {
	return r.db.Save(billing).Error
}

func (r *repository) AddExpense(expense *models.Expense) error {
	return r.db.Create(expense).Error
}

func (r *repository) AddAdvance(advance *models.Advance) error {
	return r.db.Create(advance).Error
}

func (r *repository) GetAllBillings() ([]models.Billing, error) {
	var billings []models.Billing
	err := r.db.Preload("Expenses").Preload("Advances").Find(&billings).Error
	return billings, err
}

func (r *repository) DeleteBillingByVehicleID(vehicleID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var billing models.Billing
		if err := tx.Where("vehicle_id = ?", vehicleID).First(&billing).Error; err != nil {
			return err
		}

		if err := tx.Where("billing_id = ?", billing.ID).Delete(&models.Expense{}).Error; err != nil {
			return err
		}
		if err := tx.Where("billing_id = ?", billing.ID).Delete(&models.Advance{}).Error; err != nil {
			return err
		}
		return tx.Delete(&billing).Error
	})
}
