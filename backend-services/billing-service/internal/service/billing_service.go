package service

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/makabas/billing-service/internal/models"
	"github.com/makabas/billing-service/internal/repository"
)

type BillingService interface {
	GetBillingByVehicleID(vehicleID uint) (*models.Billing, error)
	CreateBilling(vehicleID uint) (*models.Billing, error)
	AddExpense(vehicleID uint, date, desc string, amount float64) (*models.Billing, error)
	AddAdvance(vehicleID uint, date, desc string, amount float64) (*models.Billing, error)
	GetAllBillings() ([]models.Billing, error)
	DeleteBillingByVehicleID(vehicleID uint) error
}

type service struct {
	repo repository.BillingRepository
}

func NewBillingService(repo repository.BillingRepository) BillingService {
	return &service{
		repo: repo,
	}
}

func (s *service) GetBillingByVehicleID(vehicleID uint) (*models.Billing, error) {
	return s.repo.GetBillingByVehicleID(vehicleID)
}

func (s *service) CreateBilling(vehicleID uint) (*models.Billing, error) {
	// Check if already exists
	if b, err := s.repo.GetBillingByVehicleID(vehicleID); err == nil && b != nil {
		return b, nil
	}

	billing := &models.Billing{
		ID:        uuid.New().String(),
		VehicleID: vehicleID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.CreateBilling(billing); err != nil {
		return nil, err
	}

	return billing, nil
}

func (s *service) AddExpense(vehicleID uint, date, desc string, amount float64) (*models.Billing, error) {
	billing, err := s.GetBillingByVehicleID(vehicleID)
	if err != nil || billing == nil {
		log.Printf("[Service] Billing record not found for vehicle %d, attempting to create. Error: %v", vehicleID, err)
		// Try creating it if it doesn't exist
		billing, err = s.CreateBilling(vehicleID)
		if err != nil {
			log.Printf("[Service] Failed to create billing record for vehicle %d: %v", vehicleID, err)
			return nil, fmt.Errorf("failed to ensure billing record: %v", err)
		}
	}
	log.Printf("[Service] Adding expense to billing ID %s for vehicle %d: %s amt=%.2f", billing.ID, vehicleID, desc, amount)

	expense := &models.Expense{
		ID:          uuid.New().String(),
		BillingID:   billing.ID,
		Date:        date,
		Description: desc,
		Amount:      amount,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.repo.AddExpense(expense); err != nil {
		log.Printf("[Service] Failed to add expense to DB for vehicle %d: %v", vehicleID, err)
		return nil, fmt.Errorf("failed to add expense: %v", err)
	}

	// Update totals
	billing.TotalExpenses += amount
	billing.BalanceDue = billing.TotalExpenses - billing.TotalAdvances
	billing.UpdatedAt = time.Now()

	log.Printf("[Service] Updating billing totals for vehicle %d: total_exp=%.2f bal=%.2f", vehicleID, billing.TotalExpenses, billing.BalanceDue)
	if err := s.repo.UpdateBilling(billing); err != nil {
		log.Printf("[Service] Failed to update billing totals for vehicle %d: %v", vehicleID, err)
		return nil, fmt.Errorf("failed to update billing totals: %v", err)
	}

	return s.repo.GetBillingByVehicleID(vehicleID)
}

func (s *service) AddAdvance(vehicleID uint, date, desc string, amount float64) (*models.Billing, error) {
	billing, err := s.GetBillingByVehicleID(vehicleID)
	if err != nil || billing == nil {
		log.Printf("[Service] Billing record not found for vehicle %d during advance addition. Error: %v", vehicleID, err)
		// Try creating it if it doesn't exist
		billing, err = s.CreateBilling(vehicleID)
		if err != nil {
			log.Printf("[Service] Failed to create billing record for vehicle %d during advance: %v", vehicleID, err)
			return nil, fmt.Errorf("failed to ensure billing record: %v", err)
		}
	}
	log.Printf("[Service] Adding advance to billing ID %s for vehicle %d: %s amt=%.2f", billing.ID, vehicleID, desc, amount)

	advance := &models.Advance{
		ID:          uuid.New().String(),
		BillingID:   billing.ID,
		Date:        date,
		Description: desc,
		Amount:      amount,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.repo.AddAdvance(advance); err != nil {
		log.Printf("[Service] Failed to add advance to DB for vehicle %d: %v", vehicleID, err)
		return nil, fmt.Errorf("failed to add advance: %v", err)
	}

	// Update totals
	billing.TotalAdvances += amount
	billing.BalanceDue = billing.TotalExpenses - billing.TotalAdvances
	billing.UpdatedAt = time.Now()

	log.Printf("[Service] Updating billing totals for vehicle %d: total_adv=%.2f bal=%.2f", vehicleID, billing.TotalAdvances, billing.BalanceDue)
	if err := s.repo.UpdateBilling(billing); err != nil {
		log.Printf("[Service] Failed to update billing totals for vehicle %d: %v", vehicleID, err)
		return nil, fmt.Errorf("failed to update billing totals: %v", err)
	}

	return s.repo.GetBillingByVehicleID(vehicleID)
}

func (s *service) GetAllBillings() ([]models.Billing, error) {
	return s.repo.GetAllBillings()
}

func (s *service) DeleteBillingByVehicleID(vehicleID uint) error {
	return s.repo.DeleteBillingByVehicleID(vehicleID)
}
