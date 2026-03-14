package repository

type BillingRepository interface {
	GetData() (string, error)
}

type repository struct {
}

func NewBillingRepository() BillingRepository {
	return &repository{}
}

func (r *repository) GetData() (string, error) {
	return "billing data", nil
}
