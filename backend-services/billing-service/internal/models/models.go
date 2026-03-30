package models

import (
	"time"
)

type Billing struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	VehicleID     uint      `gorm:"index" json:"vehicle_id"`
	ExpenseCost   float64   `json:"expense_cost"`
	AdvanceIncome float64   `json:"advance_income"`
	TotalExpenses float64   `json:"total_expenses"`
	TotalAdvance  float64   `json:"total_advance"`
	Balance       float64   `json:"balance"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
