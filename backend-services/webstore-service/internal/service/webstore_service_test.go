package service

import (
	"errors"
	"testing"

	"github.com/makabas/webstore-service/internal/models"
)

// Mock repository
type mockWebstoreRepo struct {
	getAllProductsFunc func() ([]models.Product, error)
	searchProductsFunc func(query string) ([]models.Product, error)
	getProductByIDFunc func(id uint) (*models.Product, error)
	createProductFunc  func(p *models.Product) error
	updateProductFunc  func(p *models.Product) error
	deleteProductFunc  func(id uint) error
	createOrderFunc    func(order *models.Order) error
	getAnalyticsFunc   func() (map[string]interface{}, error)
}

func (m *mockWebstoreRepo) GetAllProducts() ([]models.Product, error) {
	return m.getAllProductsFunc()
}
func (m *mockWebstoreRepo) SearchProducts(query string) ([]models.Product, error) {
	return m.searchProductsFunc(query)
}
func (m *mockWebstoreRepo) GetProductByID(id uint) (*models.Product, error) {
	return m.getProductByIDFunc(id)
}
func (m *mockWebstoreRepo) CreateProduct(p *models.Product) error {
	return m.createProductFunc(p)
}
func (m *mockWebstoreRepo) UpdateProduct(p *models.Product) error {
	return m.updateProductFunc(p)
}
func (m *mockWebstoreRepo) DeleteProduct(id uint) error {
	return m.deleteProductFunc(id)
}
func (m *mockWebstoreRepo) CreateOrder(order *models.Order) error {
	return m.createOrderFunc(order)
}
func (m *mockWebstoreRepo) GetAnalytics() (map[string]interface{}, error) {
	return m.getAnalyticsFunc()
}

func TestWebstoreService_BuyProduct(t *testing.T) {
	t.Run("Scenario: Buying a product", func(t *testing.T) {
		tests := []struct {
			name        string
			quantity    int
			initialStock int
			mockSetup   func(m *mockWebstoreRepo)
			wantErr     bool
			expectedErr string
		}{
			{
				name:         "Success: Purchase within stock limits",
				quantity:     2,
				initialStock: 10,
				mockSetup: func(m *mockWebstoreRepo) {
					m.updateProductFunc = func(p *models.Product) error { return nil }
					m.createOrderFunc = func(order *models.Order) error { return nil }
				},
				wantErr: false,
			},
			{
				name:         "Failure: Insufficient stock available",
				quantity:     15,
				initialStock: 10,
				wantErr:      true,
				expectedErr:  "insufficient stock",
			},
			{
				name:         "Failure: Database error during update",
				quantity:     1,
				initialStock: 5,
				mockSetup: func(m *mockWebstoreRepo) {
					m.updateProductFunc = func(p *models.Product) error { return errors.New("write timeout") }
				},
				wantErr: true,
				expectedErr: "write timeout",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				// Arrange
				mockRepo := &mockWebstoreRepo{
					getProductByIDFunc: func(id uint) (*models.Product, error) {
						return &models.Product{ID: id, Name: "Test Item", Stock: tt.initialStock, Price: 50.0}, nil
					},
				}
				if tt.mockSetup != nil {
					tt.mockSetup(mockRepo)
				}
				svc := NewWebstoreService(mockRepo)

				// Act
				err := svc.BuyProduct(1, tt.quantity)

				// Assert
				if (err != nil) != tt.wantErr {
					t.Errorf("BuyProduct() error = %v, wantErr %v", err, tt.wantErr)
					return
				}
				if tt.wantErr && tt.expectedErr != "" && err.Error() != tt.expectedErr {
					t.Errorf("BuyProduct() error = %v, expected %v", err, tt.expectedErr)
				}
			})
		}
	})
}

