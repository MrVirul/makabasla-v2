package models

import (
	"time"
)

type Customer struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Name      string    `json:"name"`
	Phone     *string   `gorm:"uniqueIndex" json:"phone"`
	ImageURL  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Vehicles  []Vehicle `gorm:"foreignKey:CustomerID" json:"vehicles"`
}

type Admin struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex" json:"username"`
	Password  string    `json:"-"` // never expose password
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Name      string    `json:"name"`
	Phone     *string   `gorm:"uniqueIndex" json:"phone"`
	ImageURL  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Technician struct {
	ID             string    `gorm:"primaryKey" json:"id"`
	Email          string    `gorm:"uniqueIndex" json:"email"`
	Name           string    `json:"name"`
	Phone          *string   `gorm:"uniqueIndex" json:"phone"`
	ImageURL       string    `json:"image_url"`
	Specialization string    `json:"specialization"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Staff struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Name      string    `json:"name"`
	Phone     *string   `gorm:"uniqueIndex" json:"phone"`
	ImageURL  string    `json:"image_url"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Vehicle struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Make        string    `json:"make"`
	Model       string    `json:"model"`
	Year        int       `json:"year"`
	Color       string    `json:"color"`
	PlateNumber string    `gorm:"uniqueIndex" json:"plate_number"`
	CustomerID  string    `gorm:"index" json:"customer_id"`
	Customer    *Customer `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
