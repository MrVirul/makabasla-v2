package models

import "gorm.io/gorm"

// Appointment is a scheduled service slot for a customer's vehicle.
//
// CustomerID and TechnicianID are strings because the IAM service uses string
// identifiers (e.g. "cu-0000-0000-0000-000000000001") for customers and
// technicians. VehicleID stays numeric because IAM vehicles use an auto-increment
// bigint primary key.
type Appointment struct {
	gorm.Model
	VehicleID    uint   `gorm:"index" json:"vehicle_id"`
	CustomerID   string `gorm:"index" json:"customer_id"`
	TechnicianID string `gorm:"index" json:"technician_id"`
	Title        string `json:"title"`
	Notes        string `json:"notes"`
	Status       string `json:"status"` // scheduled, confirmed, in_progress, completed, cancelled
	ScheduledAt  string `json:"scheduled_at"`
}
