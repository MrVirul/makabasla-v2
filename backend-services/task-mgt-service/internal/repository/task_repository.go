package repository

type TaskRepository interface {
	GetData() (string, error)
}

type repository struct {
}

func NewTaskRepository() TaskRepository {
	return &repository{}
}

func (r *repository) GetData() (string, error) {
	return "task data", nil
}
