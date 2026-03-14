package repository

type AppointmentRepository interface {
	GetData() (string, error)
}

type repository struct {
}

func NewAppointmentRepository() AppointmentRepository {
	return &repository{}
}

func (r *repository) GetData() (string, error) {
	return "appointment data", nil
}
