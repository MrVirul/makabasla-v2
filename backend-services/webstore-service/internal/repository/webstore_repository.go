package repository

type WebstoreRepository interface {
	GetData() (string, error)
}

type repository struct {
}

func NewWebstoreRepository() WebstoreRepository {
	return &repository{}
}

func (r *repository) GetData() (string, error) {
	return "webstore data", nil
}
