package service

import (
	"errors"
	"testing"

	"github.com/makabas/task-mgt-service/internal/database"
	"gorm.io/gorm"
)

// Mock repository
type mockTaskRepo struct {
	createTaskFunc          func(task *database.Task) error
	getTasksByVehicleIDFunc func(vehicleID uint) ([]database.Task, error)
	getTaskByIDFunc         func(taskID uint) (*database.Task, error)
	updateTaskFunc          func(task *database.Task) error
}

func (m *mockTaskRepo) CreateTask(task *database.Task) error {
	return m.createTaskFunc(task)
}

func (m *mockTaskRepo) GetTasksByVehicleID(vehicleID uint) ([]database.Task, error) {
	return m.getTasksByVehicleIDFunc(vehicleID)
}

func (m *mockTaskRepo) GetTaskByID(taskID uint) (*database.Task, error) {
	return m.getTaskByIDFunc(taskID)
}

func (m *mockTaskRepo) UpdateTask(task *database.Task) error {
	return m.updateTaskFunc(task)
}

func TestTaskService_CreateTask(t *testing.T) {
	t.Run("Scenario: Creating a new task", func(t *testing.T) {
		mockRepo := &mockTaskRepo{
			getTasksByVehicleIDFunc: func(vehicleID uint) ([]database.Task, error) {
				// Simulate one existing task
				return []database.Task{{Model: gorm.Model{ID: 1}}}, nil
			},
			createTaskFunc: func(task *database.Task) error {
				return nil
			},
		}
		svc := NewTaskService(mockRepo)

		t.Run("Success: Create task with auto-incremented task number", func(t *testing.T) {
			task, err := svc.CreateTask(1, "Fix engine leak")
			
			if err != nil {
				t.Fatalf("CreateTask() failed: %v", err)
			}
			if task.VehicleID != 1 {
				t.Errorf("Expected VehicleID 1, got %d", task.VehicleID)
			}
			// TSK-VehicleID-SequenceNumber (Existing 1 + New 1 = 2)
			expectedTaskNum := "TSK-1-2"
			if task.TaskNumber != expectedTaskNum {
				t.Errorf("Expected TaskNumber %s, got %s", expectedTaskNum, task.TaskNumber)
			}
			if task.Status != "pending" {
				t.Errorf("Expected initial status 'pending', got %s", task.Status)
			}
		})
	})
}

func TestTaskService_UpdateTaskStatus(t *testing.T) {
	t.Run("Scenario: Updating task status", func(t *testing.T) {
		mockRepo := &mockTaskRepo{
			getTaskByIDFunc: func(taskID uint) (*database.Task, error) {
				if taskID == 1 {
					return &database.Task{Model: gorm.Model{ID: 1}, Status: "pending"}, nil
				}
				return nil, errors.New("task not found")
			},
			updateTaskFunc: func(task *database.Task) error {
				return nil
			},
		}
		svc := NewTaskService(mockRepo)

		tests := []struct {
			name      string
			taskID    uint
			newStatus string
			wantErr   bool
		}{
			{
				name:      "Success: Update existing task",
				taskID:    1,
				newStatus: "completed",
				wantErr:   false,
			},
			{
				name:      "Failure: Task does not exist",
				taskID:    99,
				newStatus: "completed",
				wantErr:   true,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				task, err := svc.UpdateTaskStatus(tt.taskID, tt.newStatus)

				if (err != nil) != tt.wantErr {
					t.Errorf("UpdateTaskStatus() error = %v, wantErr %v", err, tt.wantErr)
					return
				}
				if !tt.wantErr {
					if task.Status != tt.newStatus {
						t.Errorf("Expected status %s, got %s", tt.newStatus, task.Status)
					}
				}
			})
		}
	})
}


