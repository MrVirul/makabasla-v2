package repository

import (
	"github.com/makabas/task-mgt-service/internal/database"
	"gorm.io/gorm"
)

type TaskRepository interface {
	CreateTask(task *database.Task) error
	GetTasksByVehicleID(vehicleID uint) ([]database.Task, error)
	GetTaskByID(taskID uint) (*database.Task, error)
	UpdateTask(task *database.Task) error
}

type repository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) TaskRepository {
	return &repository{db: db}
}

func (r *repository) CreateTask(task *database.Task) error {
	return r.db.Create(task).Error
}

func (r *repository) GetTasksByVehicleID(vehicleID uint) ([]database.Task, error) {
	var tasks []database.Task
	err := r.db.Where("vehicle_id = ?", vehicleID).Find(&tasks).Error
	return tasks, err
}

func (r *repository) GetTaskByID(taskID uint) (*database.Task, error) {
	var task database.Task
	err := r.db.First(&task, taskID).Error
	return &task, err
}

func (r *repository) UpdateTask(task *database.Task) error {
	return r.db.Save(task).Error
}
