package repository

import (
	"gorm.io/gorm"
)

type AppointmentRepository interface {
	GetData() (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewAppointmentRepository(db *gorm.DB) AppointmentRepository {
	return &repository{db: db}
}

func (r *repository) GetData() (string, error) {
	return "appointment data", nil
}
