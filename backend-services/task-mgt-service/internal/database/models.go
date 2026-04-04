package database

import "gorm.io/gorm"

type Task struct {
	gorm.Model
	VehicleID   uint   `gorm:"index" json:"vehicle_id"`
	TaskNumber  string `gorm:"uniqueIndex" json:"task_number"`
	Description string `json:"description"`
	Status      string `json:"status"` // pending, start, working on, done
}
