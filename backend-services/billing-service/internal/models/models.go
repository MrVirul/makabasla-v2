package models

import (
	"time"
)

type Expense struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	BillingID   string    `gorm:"index" json:"billing_id"`
	Date        string    `json:"date"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Advance struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	BillingID   string    `gorm:"index" json:"billing_id"`
	Date        string    `json:"date"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Billing struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	VehicleID     uint      `gorm:"uniqueIndex" json:"vehicle_id"`
	Expenses      []Expense `gorm:"foreignKey:BillingID" json:"expenses"`
	Advances      []Advance `gorm:"foreignKey:BillingID" json:"advances"`
	TotalExpenses float64   `json:"total_expenses"`
	TotalAdvances float64   `json:"total_advances"`
	BalanceDue    float64   `json:"balance_due"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
