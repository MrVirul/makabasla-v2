package models

import (
	"time"
)

type Customer struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Name      string    `json:"name"`
	Phone     string    `gorm:"uniqueIndex" json:"phone"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Vehicles  []Vehicle `gorm:"foreignKey:CustomerID" json:"vehicles"`
}

type Vehicle struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Make        string    `json:"make"`
	Model       string    `json:"model"`
	Year        int       `json:"year"`
	Color       string    `json:"color"`
	PlateNumber string    `gorm:"uniqueIndex" json:"plate_number"`
	CustomerID  string    `gorm:"index" json:"customer_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
