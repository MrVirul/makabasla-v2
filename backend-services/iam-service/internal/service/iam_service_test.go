package service

import (
	"errors"
	"testing"

	"github.com/makabas/iam-service/internal/models"
)

// Mock repository
type mockIamRepo struct {
	getUserFunc            func(username string) (string, error)
	syncCustomerFunc       func(id, email, name, phone, image string) (*models.Customer, error)
	getCustomerFunc        func(id string) (*models.Customer, error)
	syncAdminFunc          func(id, email, name, phone, image string) (*models.Admin, error)
	syncTechnicianFunc     func(id, email, name, phone, image string) (*models.Technician, error)
	syncStaffFunc          func(id, email, name, role, phone, image string) (*models.Staff, error)
	createVehicleFunc      func(vehicle *models.Vehicle) error
	getVehiclesFunc        func(customerID string) ([]models.Vehicle, error)
	getAllVehiclesFunc     func() ([]models.Vehicle, error)
	getAllCustomersFunc    func() ([]models.Customer, error)
	loginAdminFunc         func(username, password string) (*models.Admin, error)
	loginCustomerFunc      func(email, password string) (*models.Customer, error)
	createCustomerFunc     func(customer *models.Customer) error
	getCustomerByEmailFunc func(email string) (*models.Customer, error)
	getCustomerByPhoneFunc func(phone string) (*models.Customer, error)
	updateVehicleFunc      func(v *models.Vehicle) error
	deleteVehicleFunc      func(id uint) error
}

func (m *mockIamRepo) GetUser(username string) (string, error) { return m.getUserFunc(username) }
func (m *mockIamRepo) SyncCustomer(id, email, name, phone, image string) (*models.Customer, error) {
	return m.syncCustomerFunc(id, email, name, phone, image)
}
func (m *mockIamRepo) GetCustomer(id string) (*models.Customer, error) { return m.getCustomerFunc(id) }
func (m *mockIamRepo) SyncAdmin(id, email, name, phone, image string) (*models.Admin, error) {
	return m.syncAdminFunc(id, email, name, phone, image)
}
func (m *mockIamRepo) SyncTechnician(id, email, name, phone, image string) (*models.Technician, error) {
	return m.syncTechnicianFunc(id, email, name, phone, image)
}
func (m *mockIamRepo) SyncStaff(id, email, name, role, phone, image string) (*models.Staff, error) {
	return m.syncStaffFunc(id, email, name, role, phone, image)
}
func (m *mockIamRepo) CreateVehicle(v *models.Vehicle) error { return m.createVehicleFunc(v) }
func (m *mockIamRepo) GetVehicles(id string) ([]models.Vehicle, error) { return m.getVehiclesFunc(id) }
func (m *mockIamRepo) GetAllVehicles() ([]models.Vehicle, error) { return m.getAllVehiclesFunc() }
func (m *mockIamRepo) GetAllCustomers() ([]models.Customer, error) { return m.getAllCustomersFunc() }
func (m *mockIamRepo) LoginAdmin(u, p string) (*models.Admin, error) { return m.loginAdminFunc(u, p) }
func (m *mockIamRepo) LoginCustomer(e, p string) (*models.Customer, error) {
	return m.loginCustomerFunc(e, p)
}
func (m *mockIamRepo) CreateCustomer(c *models.Customer) error { return m.createCustomerFunc(c) }
func (m *mockIamRepo) GetCustomerByEmail(e string) (*models.Customer, error) {
	return m.getCustomerByEmailFunc(e)
}
func (m *mockIamRepo) GetCustomerByPhone(p string) (*models.Customer, error) {
	return m.getCustomerByPhoneFunc(p)
}
func (m *mockIamRepo) UpdateVehicle(v *models.Vehicle) error { return m.updateVehicleFunc(v) }
func (m *mockIamRepo) DeleteVehicle(id uint) error          { return m.deleteVehicleFunc(id) }

func TestIamService_RegisterCustomer(t *testing.T) {
	t.Run("Scenario: Customer Registration", func(t *testing.T) {
		tests := []struct {
			name        string
			email       string
			phone       string
			mockSetup   func(m *mockIamRepo)
			wantErr     bool
			expectedErr string
		}{
			{
				name:  "Success: Valid registration",
				email: "new@test.com",
				phone: "0123456789",
				mockSetup: func(m *mockIamRepo) {
					m.getCustomerByEmailFunc = func(e string) (*models.Customer, error) { return nil, errors.New("not found") }
					m.getCustomerByPhoneFunc = func(p string) (*models.Customer, error) { return nil, errors.New("not found") }
					m.createCustomerFunc = func(c *models.Customer) error { return nil }
				},
				wantErr: false,
			},
			{
				name:    "Failure: Invalid phone length",
				email:   "fail@test.com",
				phone:   "123",
				wantErr: true,
				expectedErr: "phone number must contain exactly 10 digits",
			},
			{
				name:  "Failure: Email already exists",
				email: "existing@test.com",
				phone: "0123456789",
				mockSetup: func(m *mockIamRepo) {
					m.getCustomerByEmailFunc = func(e string) (*models.Customer, error) {
						return &models.Customer{Email: e, Password: "hashed_pass"}, nil
					}
				},
				wantErr: true,
				expectedErr: "an account with this email already exists",
			},
			{
				name:  "Failure: Phone number already exists",
				email: "unique@test.com",
				phone: "0000000000",
				mockSetup: func(m *mockIamRepo) {
					m.getCustomerByEmailFunc = func(e string) (*models.Customer, error) { return nil, errors.New("not found") }
					m.getCustomerByPhoneFunc = func(p string) (*models.Customer, error) {
						return &models.Customer{ID: "existing_id"}, nil
					}
				},
				wantErr: true,
				expectedErr: "this phone number is already registered",
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				// Arrange
				mockRepo := &mockIamRepo{}
				if tt.mockSetup != nil {
					tt.mockSetup(mockRepo)
				}
				svc := NewIamService(mockRepo)

				// Act
				res, err := svc.RegisterCustomer(tt.email, "pass123", "User Name", tt.phone)

				// Assert
				if (err != nil) != tt.wantErr {
					t.Errorf("RegisterCustomer() error = %v, wantErr %v", err, tt.wantErr)
					return
				}
				if tt.wantErr && err.Error() != tt.expectedErr {
					t.Errorf("RegisterCustomer() error = %v, expectedErr %v", err, tt.expectedErr)
				}
				if !tt.wantErr && res == nil {
					t.Error("RegisterCustomer() expected non-nil result on success")
				}
			})
		}
	})
}

func TestIamService_SyncProfile(t *testing.T) {
	t.Run("Scenario: Profile Synchronization", func(t *testing.T) {
		mockRepo := &mockIamRepo{
			syncAdminFunc: func(id, email, name, phone, image string) (*models.Admin, error) {
				return &models.Admin{ID: id, Name: name, Email: email}, nil
			},
			syncCustomerFunc: func(id, email, name, phone, image string) (*models.Customer, error) {
				return &models.Customer{ID: id, Name: name, Email: email}, nil
			},
		}
		svc := NewIamService(mockRepo)

		// Test Admin Sync
		t.Run("Sync Admin Profile", func(t *testing.T) {
			res, err := svc.SyncProfile("id1", "admin@test.com", "Admin User", "1234567890", "ADMIN", "")
			if err != nil {
				t.Fatalf("Unexpected error: %v", err)
			}
			admin, ok := res.(*models.Admin)
			if !ok || admin.Name != "Admin User" {
				t.Errorf("SyncProfile() failed to return correct admin profile")
			}
		})

		// Test Customer Sync
		t.Run("Sync Customer Profile", func(t *testing.T) {
			res, err := svc.SyncProfile("id2", "cust@test.com", "Cust User", "1234567890", "CUSTOMER", "")
			if err != nil {
				t.Fatalf("Unexpected error: %v", err)
			}
			customer, ok := res.(*models.Customer)
			if !ok || customer.Name != "Cust User" {
				t.Errorf("SyncProfile() failed to return correct customer profile")
			}
		})
	})
}

