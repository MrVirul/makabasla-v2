package repository

import (
	"gorm.io/gorm"
)

type TaskRepository interface {
	GetData() (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) TaskRepository {
	return &repository{db: db}
}

func (r *repository) GetData() (string, error) {
	return "task data", nil
}
