package models

import "gorm.io/gorm"

// Appointment is a scheduled service slot for a customer's vehicle.
type Appointment struct {
	gorm.Model
	VehicleID    uint   `gorm:"index" json:"vehicle_id"`
	CustomerID   uint   `gorm:"index" json:"customer_id"`
	TechnicianID uint   `gorm:"index" json:"technician_id"`
	Title        string `json:"title"`
	Notes        string `json:"notes"`
	Status       string `json:"status"` // scheduled, confirmed, in_progress, completed, cancelled
	ScheduledAt  string `json:"scheduled_at"`
}
