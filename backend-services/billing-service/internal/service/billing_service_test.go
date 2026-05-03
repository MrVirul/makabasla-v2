package service

import (
	"testing"

	"github.com/makabas/billing-service/internal/models"
)

// Mock repository
type mockBillingRepo struct {
	getBillingByVehicleIDFunc func(vehicleID uint) (*models.Billing, error)
	createBillingFunc         func(billing *models.Billing) error
	updateBillingFunc         func(billing *models.Billing) error
	addExpenseFunc            func(expense *models.Expense) error
	addAdvanceFunc            func(advance *models.Advance) error
	getAllBillingsFunc        func() ([]models.Billing, error)
	deleteBillingByVehicleIDFunc func(vehicleID uint) error
}

func (m *mockBillingRepo) GetBillingByVehicleID(vehicleID uint) (*models.Billing, error) {
	return m.getBillingByVehicleIDFunc(vehicleID)
}
func (m *mockBillingRepo) CreateBilling(billing *models.Billing) error {
	return m.createBillingFunc(billing)
}
func (m *mockBillingRepo) UpdateBilling(billing *models.Billing) error {
	return m.updateBillingFunc(billing)
}
func (m *mockBillingRepo) AddExpense(expense *models.Expense) error {
	return m.addExpenseFunc(expense)
}
func (m *mockBillingRepo) AddAdvance(advance *models.Advance) error {
	return m.addAdvanceFunc(advance)
}
func (m *mockBillingRepo) GetAllBillings() ([]models.Billing, error) {
	return m.getAllBillingsFunc()
}
func (m *mockBillingRepo) DeleteBillingByVehicleID(vehicleID uint) error {
	return m.deleteBillingByVehicleIDFunc(vehicleID)
}

func TestBillingService_AddExpense(t *testing.T) {
	t.Run("Scenario: Adding an expense to a vehicle billing record", func(t *testing.T) {
		// Arrange: Set up stateful mock
		store := make(map[uint]*models.Billing)
		store[1] = &models.Billing{ID: "bill-1", VehicleID: 1, TotalExpenses: 100.0}

		mockRepo := &mockBillingRepo{
			getBillingByVehicleIDFunc: func(id uint) (*models.Billing, error) { return store[id], nil },
			createBillingFunc: func(b *models.Billing) error {
				b.ID = "new-bill"
				store[b.VehicleID] = b
				return nil
			},
			addExpenseFunc:    func(e *models.Expense) error { return nil },
			updateBillingFunc: func(b *models.Billing) error { store[b.VehicleID] = b; return nil },
		}
		svc := NewBillingService(mockRepo)

		t.Run("Success: Add expense to existing billing", func(t *testing.T) {
			billing, err := svc.AddExpense(1, "2026-05-03", "Brake Pad Replacement", 75.50)
			
			if err != nil {
				t.Fatalf("AddExpense() failed: %v", err)
			}
			// 100.0 (initial) + 75.50 = 175.50
			if billing.TotalExpenses != 175.50 {
				t.Errorf("Expected total expenses 175.50, got %f", billing.TotalExpenses)
			}
		})

		t.Run("Success: Add expense to non-existent billing (should auto-create)", func(t *testing.T) {
			billing, err := svc.AddExpense(2, "2026-05-03", "Initial Inspection", 50.0)
			
			if err != nil {
				t.Fatalf("AddExpense() failed on auto-creation: %v", err)
			}
			if billing.TotalExpenses != 50.0 {
				t.Errorf("Expected total expenses 50.0, got %f", billing.TotalExpenses)
			}
			if billing.ID != "new-bill" {
				t.Errorf("Expected auto-created billing ID 'new-bill', got %s", billing.ID)
			}
		})
	})
}

func TestBillingService_AddAdvance(t *testing.T) {
	t.Run("Scenario: Adding an advance payment", func(t *testing.T) {
		store := make(map[uint]*models.Billing)
		store[1] = &models.Billing{
			ID:            "bill-1",
			VehicleID:     1,
			TotalExpenses: 500.0,
			TotalAdvances: 100.0,
			BalanceDue:    400.0,
		}

		mockRepo := &mockBillingRepo{
			getBillingByVehicleIDFunc: func(id uint) (*models.Billing, error) { return store[id], nil },
			addAdvanceFunc:    func(a *models.Advance) error { return nil },
			updateBillingFunc: func(b *models.Billing) error { store[b.VehicleID] = b; return nil },
		}
		svc := NewBillingService(mockRepo)

		t.Run("Success: Update totals and balance correctly", func(t *testing.T) {
			billing, err := svc.AddAdvance(1, "2026-05-03", "Partial Payment", 200.0)
			
			if err != nil {
				t.Fatalf("AddAdvance() failed: %v", err)
			}
			// 100.0 (initial) + 200.0 = 300.0
			if billing.TotalAdvances != 300.0 {
				t.Errorf("Expected total advances 300.0, got %f", billing.TotalAdvances)
			}
			// 500.0 (expenses) - 300.0 (advances) = 200.0
			if billing.BalanceDue != 200.0 {
				t.Errorf("Expected balance due 200.0, got %f", billing.BalanceDue)
			}
		})
	})
}


